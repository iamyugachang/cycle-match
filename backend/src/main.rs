mod model;
mod db;
mod matcher;

use axum::{
    routing::{get, post},
    Router, extract::State,
    http::Method, extract::Json,
    response::IntoResponse,
};
use serde::Serialize;
use serde::Deserialize;
use reqwest::Client;
use serde_json::Value;
use sqlx::{postgres::PgPoolOptions, Pool, Postgres, Row};
use tower_http::cors::{CorsLayer, Any};
use std::net::SocketAddr;
use model::{Teacher, MatchResult};
use axum::extract::Query;
use std::collections::HashMap;

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt::init();

    let database_url = std::env::var("DATABASE_URL")
        .unwrap_or_else(|_| "postgres://app:password@db:5432/circlematch".to_string());

    let pool = PgPoolOptions::new()
        .max_connections(5)
        .connect(&database_url)
        .await
        .expect("Failed to connect to database");

    // 初始化資料庫
    db::init_db(&pool).await.expect("Failed to initialize database");

    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods([Method::GET, Method::POST])
        .allow_headers(Any);

    let app = Router::new()
        .route("/", get(root))
        .route("/api/hello", get(hello))
        .route("/api/teachers", get(get_teachers))
        .route("/api/teachers", post(create_teacher))
        .route("/api/matches", get(find_matches))
        .route("/api/google-login", post(google_login))
        .route("/api/districts", get(get_districts))
        .with_state(pool)
        .layer(cors);

    let addr = SocketAddr::from(([0, 0, 0, 0], 8000));
    tracing::info!("Server listening on {}", addr);
    
    let listener = tokio::net::TcpListener::bind(&addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}

// 返回縣市區域資料
async fn get_districts() -> impl IntoResponse {
    let districts = db::get_taiwan_districts();
    Json(districts)
}

async fn root() -> &'static str {
    "CircleMatch API is running"
}

async fn hello(State(pool): State<sqlx::PgPool>) -> Json<Message> {
    let row = sqlx::query("SELECT text FROM messages LIMIT 1")
        .fetch_optional(&pool)
        .await
        .unwrap_or(None);
    
    let text = match row {
        Some(row) => row.get::<String, _>(0),
        None => "Default message".to_string()
    };
    
    Json(Message { text })
}

#[derive(Serialize)]
struct Message {
    text: String,
}

async fn get_teachers(
    State(pool): State<Pool<Postgres>>,
    Query(params): Query<HashMap<String, String>>,
) -> Json<Vec<Teacher>> {
    // 檢查是否有 google_id 參數
    if let Some(google_id) = params.get("google_id") {
        // 根據 google_id 查詢
        if let Ok(teacher) = db::get_teacher_by_google_id(&pool, google_id).await {
            return Json(vec![teacher]);
        }
        return Json(vec![]);
    }

    // 無 google_id 參數時獲取所有教師
    let teachers = db::get_all_teachers(&pool)
        .await
        .unwrap_or_default();
    
    Json(teachers)
}

async fn create_teacher(
    State(pool): State<Pool<Postgres>>,
    Json(mut teacher): Json<Teacher>
) -> Result<Json<Teacher>, (axum::http::StatusCode, String)> {
    tracing::info!("接收到的教師數據: {:?}", teacher);

    // 檢查必填欄位
    if teacher.current_county.trim().is_empty() {
        return Err((
            axum::http::StatusCode::BAD_REQUEST,
            "縣市不能為空".to_string(),
        ));
    }
    
    if teacher.current_district.trim().is_empty() {
        return Err((
            axum::http::StatusCode::BAD_REQUEST,
            "區域不能為空".to_string(),
        ));
    }

    // 如果名稱為空，設置為預設值
    if teacher.name.is_none() || teacher.name.as_ref().unwrap().is_empty() {
        teacher.name = Some("Anonymous".to_string());
    }

    // 如果 display_id 為空，生成一個新的 display_id
    if teacher.display_id.is_none() || teacher.display_id.as_ref().unwrap().is_empty() {
        teacher.display_id = Some(db::generate_display_id(&teacher.current_county, &teacher.current_district));
    }

    // 確保 google_id 被正確處理
    match &teacher.google_id {
        Some(google_id) if !google_id.is_empty() => {
            tracing::info!("Google ID 已提供: {}", google_id);
        }
        _ => {
            return Err((
                axum::http::StatusCode::BAD_REQUEST,
                "缺少 google_id，請重新登入".to_string(),
            ));
        }
    }

    // 將教師數據寫入資料庫
    match db::create_teacher(&pool, teacher).await {
        Ok(created) => {
            tracing::info!("成功創建教師: {:?}", created);
            Ok(Json(created))
        },
        Err(e) => {
            let error_msg = format!("創建教師失敗: {}", e);
            tracing::error!("{}", error_msg);
            Err((axum::http::StatusCode::INTERNAL_SERVER_ERROR, error_msg))
        }
    }
}

async fn find_matches(
    State(pool): State<Pool<Postgres>>,
    Query(_params): Query<HashMap<String, String>>,
) -> Json<Vec<MatchResult>> {
    tracing::info!("收到配對結果請求");

    let all_teachers = db::get_all_teachers(&pool).await.unwrap_or_default();

    tracing::info!("教師數量: {}", all_teachers.len());

    // 處理所有教師的配對邏輯
    let matches = matcher::find_matches(all_teachers);

    tracing::info!("配對結果數量: {}", matches.len());

    Json(matches)
}

#[derive(Deserialize)]
struct GoogleLoginRequest {
    token: String,
}

async fn google_login(
    State(pool): State<Pool<Postgres>>,
    Json(payload): Json<GoogleLoginRequest>,
) -> Result<Json<Value>, (axum::http::StatusCode, String)> {
    let client_id = std::env::var("GOOGLE_CLIENT_ID").expect("GOOGLE_CLIENT_ID must be set");
    let client_secret = std::env::var("GOOGLE_CLIENT_SECRET").expect("GOOGLE_CLIENT_SECRET must be set");

    // 驗證 Google Token
    match verify_google_token(&payload.token, &client_id, &client_secret).await {
        Ok(user_info) => {
            tracing::info!("Google 登入成功: {:?}", user_info);

            // 在驗證成功後，獲取與 google_id 關聯的所有教師資料
            let google_id = &user_info.email;
            let teachers = db::get_teachers_by_google_id(&pool, google_id).await.unwrap_or_default();

            // 如果有教師資料，選擇第一筆作為主要資料（向後兼容）
            let primary_teacher = teachers.first().cloned();

            Ok(Json(serde_json::json!({
                "email": user_info.email,
                "google_id": user_info.email,
                "name": user_info.name,
                "picture": user_info.picture,
                "teacher": primary_teacher, // 向後兼容，只返回第一筆教師記錄
                "teachers": teachers // 新增: 返回所有關聯的教師記錄
            })))
        }
        Err(err) => {
            tracing::error!("Google 登入失敗: {}", err);
            Err((axum::http::StatusCode::UNAUTHORIZED, "驗證失敗".to_string()))
        }
    }
}

async fn verify_google_token(token: &str, client_id: &str, _client_secret: &str) -> Result<GoogleTokenInfo, String> {
    let client = Client::new();
    let google_api_url = format!(
        "https://oauth2.googleapis.com/tokeninfo?id_token={}",
        token
    );

    let response = client.get(&google_api_url).send().await.map_err(|err| {
        format!("無法連接到 Google API: {}", err)
    })?;

    if !response.status().is_success() {
        return Err("Google Token 驗證失敗".to_string());
    }

    let token_info: Value = response.json().await.map_err(|err| {
        format!("解析 Google 回應失敗: {}", err)
    })?;

    if token_info["aud"].as_str() != Some(client_id) {
        return Err("Token 的 audience 不匹配".to_string());
    }

    Ok(GoogleTokenInfo {
        email: token_info["email"].as_str().unwrap_or("未知使用者").to_string(),
        name: token_info["name"].as_str().unwrap_or("未知使用者").to_string(),
        picture: token_info["picture"].as_str().unwrap_or("").to_string(),
    })
}

#[derive(Serialize, Deserialize, Debug)]
struct GoogleTokenInfo {
    email: String,
    name: String,
    picture: String,
}