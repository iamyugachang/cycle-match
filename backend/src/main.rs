mod model;
mod db;
mod matcher;

use axum::{
    routing::{get, post},
    Router, extract::State,
    http::Method, extract::Json,
    http::StatusCode,
};
use serde::Serialize;
use serde::Deserialize;
use reqwest::Client;
use serde_json::Value;
use sqlx::{postgres::PgPoolOptions, Pool, Postgres, Row};
use tower_http::cors::{CorsLayer, Any};
use std::net::SocketAddr;
use model::{Teacher, MatchResult};

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
        .with_state(pool)
        .layer(cors);

    let addr = SocketAddr::from(([0, 0, 0, 0], 8000));
    tracing::info!("Server listening on {}", addr);
    
    let listener = tokio::net::TcpListener::bind(&addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
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
    State(pool): State<Pool<Postgres>>
) -> Json<Vec<Teacher>> {
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
    
    // 如果未提供姓名，設置一個默認值
    if teacher.name.is_none() || teacher.name.as_ref().unwrap().is_empty() {
        teacher.name = Some("Anonymous".to_string());
    }
    
    // 生成匿名顯示ID（如果未提供）
    if teacher.display_id.is_none() || teacher.display_id.as_ref().unwrap().is_empty() {
        teacher.display_id = Some(db::generate_display_id(&teacher.current_county, &teacher.current_district));
    }
    
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
    State(pool): State<Pool<Postgres>>
) -> Json<Vec<MatchResult>> {
    let teachers = db::get_all_teachers(&pool)
        .await
        .unwrap_or_default();
    
    let matches = matcher::find_matches(teachers);
    Json(matches)
}

#[derive(Deserialize)]
struct GoogleLoginRequest {
    token: String,
}

async fn google_login(
    Json(payload): Json<GoogleLoginRequest>,
) -> Result<Json<Value>, (axum::http::StatusCode, String)> {
    let client_id = std::env::var("GOOGLE_CLIENT_ID").expect("GOOGLE_CLIENT_ID must be set");
    let client_secret = std::env::var("GOOGLE_CLIENT_SECRET").expect("GOOGLE_CLIENT_SECRET must be set");

    // 驗證 Google Token
    match verify_google_token(&payload.token, &client_id, &client_secret).await {
        Ok(user_info) => {
            tracing::info!("Google 登入成功: {:?}", user_info);

            // 返回使用者資訊
            Ok(Json(serde_json::json!({
                "email": user_info.email,
                "name": user_info.name,
                "picture": user_info.picture,
                "teacher": null // 這裡可以返回教師資訊（如果需要）
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