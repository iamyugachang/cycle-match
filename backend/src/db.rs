use sqlx::{Pool, Postgres, Row};
use crate::model::Teacher;
use chrono::Utc;
use rand::{thread_rng, Rng};
use uuid::Uuid;

// 用於生成顯示ID的函數
pub fn generate_display_id(county: &str, district: &str) -> String {
    // 取得當前時間戳作為唯一性保證
    let timestamp = Utc::now().timestamp_millis();
    // 生成一個短雜湊
    let hash = timestamp % 1000;
    
    // 組合成格式：縣市+區域+時間戳尾碼
    format!("{}{}{:03}", county, district, hash)
}

pub async fn get_all_teachers(pool: &Pool<Postgres>) -> Result<Vec<Teacher>, sqlx::Error> {
    let rows = sqlx::query(
        r#"
        SELECT 
            id, 
            name,
            display_id,
            email,
            year, 
            current_county,
            current_district,
            current_school,
            target_counties,
            target_districts,
            created_at
        FROM teachers
        "#
    )
    .fetch_all(pool)
    .await?;

    let teachers = rows.into_iter().map(|row| {
        Teacher {
            id: row.get("id"),
            name: row.get("name"),
            display_id: row.get("display_id"),
            email: row.get("email"),
            year: row.get("year"),
            current_county: row.get("current_county"),
            current_district: row.get("current_district"),
            current_school: row.get("current_school"),
            target_counties: row.get("target_counties"),
            target_districts: row.get("target_districts"),
            created_at: row.get("created_at"),
        }
    }).collect();

    Ok(teachers)
}

pub async fn create_teacher(pool: &Pool<Postgres>, teacher: Teacher) -> Result<Teacher, sqlx::Error> {
    // 確保姓名有值
    let name = teacher.name.clone().unwrap_or_else(|| format!("User-{}", Uuid::new_v4()));
    
    // 確保顯示ID有值
    let display_id = teacher.display_id.clone().unwrap_or_else(|| 
        generate_display_id(&teacher.current_county, &teacher.current_district)
    );
    
    let row = sqlx::query(
        r#"
        INSERT INTO teachers (
            name,
            display_id,
            email,
            year,
            current_county, 
            current_district, 
            current_school, 
            target_counties,
            target_districts,
            created_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING 
            id, 
            name,
            display_id,
            email,
            year,
            current_county, 
            current_district, 
            current_school, 
            target_counties,
            target_districts,
            created_at
        "#
    )
    .bind(&name)
    .bind(&display_id)
    .bind(&teacher.email)
    .bind(&teacher.year)
    .bind(&teacher.current_county)
    .bind(&teacher.current_district)
    .bind(&teacher.current_school)
    .bind(&teacher.target_counties)
    .bind(&teacher.target_districts)
    .bind(Utc::now())
    .fetch_one(pool)
    .await?;

    let created_teacher = Teacher {
        id: row.get("id"),
        name: Some(row.get("name")),
        display_id: Some(row.get("display_id")),
        email: row.get("email"),
        year: row.get("year"),
        current_county: row.get("current_county"),
        current_district: row.get("current_district"),
        current_school: row.get("current_school"),
        target_counties: row.get("target_counties"),
        target_districts: row.get("target_districts"),
        created_at: row.get("created_at"),
    };

    Ok(created_teacher)
}

pub async fn init_db(pool: &Pool<Postgres>) -> Result<(), sqlx::Error> {
    // 先刪除舊表（如果存在）
    sqlx::query("DROP TABLE IF EXISTS teachers")
        .execute(pool)
        .await?;

    // 創建新表，與當前模型匹配
    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS teachers (
            id SERIAL PRIMARY KEY,
            name TEXT NOT NULL,
            display_id TEXT NOT NULL,
            email TEXT NOT NULL,
            year INTEGER NOT NULL,
            current_county TEXT NOT NULL,
            current_district TEXT NOT NULL,
            current_school TEXT NOT NULL,
            target_counties TEXT[] NOT NULL,
            target_districts TEXT[] NOT NULL,
            created_at TIMESTAMPTZ NOT NULL
        )
        "#
    )
    .execute(pool)
    .await?;

    // 添加測試數據
    add_test_data(pool).await?;

    tracing::info!("資料庫初始化完成：teachers 表已創建並添加測試數據");
    Ok(())
}

// 添加測試數據的函數
async fn add_test_data(pool: &Pool<Postgres>) -> Result<(), sqlx::Error> {
    // 測試數據：台北市教師
    let taipei_teachers = [
        Teacher {
            id: None,
            name: Some("測試教師1".to_string()),
            display_id: Some("台北市大安區001".to_string()),
            email: format!("test1@example.com"),
            year: 114,
            current_county: "台北市".to_string(),
            current_district: "大安區".to_string(),
            current_school: "大安國小".to_string(),
            target_counties: vec!["新北市".to_string()],
            target_districts: vec!["板橋區".to_string()],
            created_at: None,
        },
        Teacher {
            id: None,
            name: Some("測試教師2".to_string()),
            display_id: Some("台北市信義區002".to_string()),
            email: format!("test2@example.com"),
            year: 114,
            current_county: "台北市".to_string(),
            current_district: "信義區".to_string(),
            current_school: "信義國小".to_string(),
            target_counties: vec!["台北市".to_string(), "台中市".to_string()],
            target_districts: vec!["大安區".to_string(), "西區".to_string()],
            created_at: None,
        },
        Teacher {
            id: None,
            name: Some("測試教師3".to_string()),
            display_id: Some("台北市中正區003".to_string()),
            email: format!("test3@example.com"),
            year: 114,
            current_county: "台北市".to_string(),
            current_district: "中正區".to_string(),
            current_school: "中正國小".to_string(),
            target_counties: vec!["新北市".to_string(), "台中市".to_string()],
            target_districts: vec!["中和區".to_string(), "北區".to_string()],
            created_at: None,
        },
    ];

    // 測試數據：新北市教師
    let new_taipei_teachers = [
        Teacher {
            id: None,
            name: Some("測試教師4".to_string()),
            display_id: Some("新北市板橋區004".to_string()),
            email: format!("test4@example.com"),
            year: 114,
            current_county: "新北市".to_string(),
            current_district: "板橋區".to_string(),
            current_school: "板橋國小".to_string(),
            target_counties: vec!["台北市".to_string()],
            target_districts: vec!["大安區".to_string()],
            created_at: None,
        },
        Teacher {
            id: None,
            name: Some("測試教師5".to_string()),
            display_id: Some("新北市中和區005".to_string()),
            email: format!("test5@example.com"),
            year: 114,
            current_county: "新北市".to_string(),
            current_district: "中和區".to_string(),
            current_school: "中和國小".to_string(),
            target_counties: vec!["台北市".to_string(), "桃園市".to_string()],
            target_districts: vec!["中正區".to_string(), "中壢區".to_string()],
            created_at: None,
        },
        Teacher {
            id: None,
            name: Some("測試教師6".to_string()),
            display_id: Some("新北市三重區006".to_string()),
            email: format!("test6@example.com"),
            year: 114,
            current_county: "新北市".to_string(),
            current_district: "三重區".to_string(),
            current_school: "三重國小".to_string(),
            target_counties: vec!["台北市".to_string(), "台中市".to_string()],
            target_districts: vec!["信義區".to_string(), "西區".to_string()],
            created_at: None,
        },
    ];

    // 測試數據：台中市教師
    let taichung_teachers = [
        Teacher {
            id: None,
            name: Some("測試教師7".to_string()),
            display_id: Some("台中市西區007".to_string()),
            email: format!("test7@example.com"),
            year: 114,
            current_county: "台中市".to_string(),
            current_district: "西區".to_string(),
            current_school: "西區國小".to_string(),
            target_counties: vec!["新北市".to_string()],
            target_districts: vec!["板橋區".to_string()],
            created_at: None,
        },
        Teacher {
            id: None,
            name: Some("測試教師8".to_string()),
            display_id: Some("台中市北區008".to_string()),
            email: format!("test8@example.com"),
            year: 114,
            current_county: "台中市".to_string(),
            current_district: "北區".to_string(),
            current_school: "北區國小".to_string(),
            target_counties: vec!["台北市".to_string(), "新北市".to_string()],
            target_districts: vec!["大安區".to_string(), "三重區".to_string()],
            created_at: None,
        },
    ];
    
    // 測試數據：桃園市教師
    let taoyuan_teachers = [
        Teacher {
            id: None,
            name: Some("測試教師9".to_string()),
            display_id: Some("桃園市中壢區009".to_string()),
            email: format!("test9@example.com"),
            year: 114,
            current_county: "桃園市".to_string(),
            current_district: "中壢區".to_string(),
            current_school: "中壢國小".to_string(),
            target_counties: vec!["新北市".to_string(), "台北市".to_string()],
            target_districts: vec!["中和區".to_string(), "大安區".to_string()],
            created_at: None,
        },
        Teacher {
            id: None,
            name: Some("測試教師10".to_string()),
            display_id: Some("桃園市桃園區010".to_string()),
            email: format!("test10@example.com"),
            year: 114,
            current_county: "桃園市".to_string(),
            current_district: "桃園區".to_string(),
            current_school: "桃園國小".to_string(),
            target_counties: vec!["台中市".to_string(), "新北市".to_string()],
            target_districts: vec!["西區".to_string(), "板橋區".to_string()],
            created_at: None,
        },
    ];

    // 合併所有測試數據
    let test_teachers = [
        &taipei_teachers[..], 
        &new_taipei_teachers[..], 
        &taichung_teachers[..],
        &taoyuan_teachers[..]
    ].concat();

    // 將測試數據插入數據庫
    for teacher in test_teachers {
        sqlx::query(
            r#"
            INSERT INTO teachers (
                name,
                display_id,
                email,
                year,
                current_county, 
                current_district, 
                current_school, 
                target_counties,
                target_districts,
                created_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            "#
        )
        .bind(&teacher.name)
        .bind(&teacher.display_id)
        .bind(&teacher.email)
        .bind(&teacher.year)
        .bind(&teacher.current_county)
        .bind(&teacher.current_district)
        .bind(&teacher.current_school)
        .bind(&teacher.target_counties)
        .bind(&teacher.target_districts)
        .bind(Utc::now())
        .execute(pool)
        .await?;
    }

    Ok(())
}