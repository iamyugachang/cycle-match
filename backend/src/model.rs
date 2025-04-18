use serde::{Deserialize, Serialize};
use chrono::{Utc, DateTime};

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Teacher {
    pub id: Option<i32>,
    pub name: Option<String>,
    pub display_id: Option<String>,
    pub email: String,
    pub google_id: Option<String>,
    pub year: i32,
    pub subject: String,  // Added subject field
    pub current_county: String,
    pub current_district: String,
    pub current_school: String,
    pub target_counties: Vec<String>,
    pub target_districts: Vec<String>,
    pub created_at: Option<DateTime<Utc>>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct MatchResult {
    pub match_type: String,
    pub teachers: Vec<Teacher>,
}