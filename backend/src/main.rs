mod model;
mod db;
mod matcher;

use axum::{
    routing::{get, post},
    Router, Json, extract::State,
    http::Method,
};
use serde::Serialize;
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