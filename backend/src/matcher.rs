use crate::model::{Teacher, MatchResult};
use std::collections::HashSet;

pub fn find_matches(teachers: Vec<Teacher>) -> Vec<MatchResult> {
    let mut results = Vec::new();
    
    // 尋找直接互調配對 (兩個人互換)
    find_direct_swaps(&teachers, &mut results);
    
    // 尋找三角調配對 (三人循環)
    find_triangle_swaps(&teachers, &mut results);
    
    // 去除重複的循環配對
    results = remove_duplicate_cycles(results);
    
    results
}

fn find_direct_swaps(teachers: &[Teacher], results: &mut Vec<MatchResult>) {
    let mut seen_pairs = HashSet::new();

    for i in 0..teachers.len() {
        for j in (i+1)..teachers.len() {
            let teacher_a = &teachers[i];
            let teacher_b = &teachers[j];
            
            // 檢查 A 想去 B 的縣市區域，B 想去 A 的縣市區域
            if wants_location(teacher_a, teacher_b) && 
               wants_location(teacher_b, teacher_a) {
                
                // 創建一個唯一識別這對教師的鍵
                let a_id = teacher_a.id.unwrap_or(0);
                let b_id = teacher_b.id.unwrap_or(0);
                let pair_key = if a_id < b_id {
                    (a_id, b_id)
                } else {
                    (b_id, a_id)
                };
                
                // 確保不重複添加相同的配對
                if !seen_pairs.contains(&pair_key) {
                    results.push(MatchResult {
                        match_type: "direct_swap".to_string(),
                        teachers: vec![teacher_a.clone(), teacher_b.clone()],
                    });
                    seen_pairs.insert(pair_key);
                }
            }
        }
    }
}

fn find_triangle_swaps(teachers: &[Teacher], results: &mut Vec<MatchResult>) {
    for i in 0..teachers.len() {
        for j in 0..teachers.len() {
            if i == j { continue; }
            
            for k in 0..teachers.len() {
                if i == k || j == k { continue; }
                
                let teacher_a = &teachers[i];
                let teacher_b = &teachers[j];
                let teacher_c = &teachers[k];
                
                // 檢查三角調的條件: A→B→C→A
                if wants_location(teacher_a, teacher_b) && 
                   wants_location(teacher_b, teacher_c) && 
                   wants_location(teacher_c, teacher_a) {
                    
                    results.push(MatchResult {
                        match_type: "triangle_swap".to_string(),
                        teachers: vec![teacher_a.clone(), teacher_b.clone(), teacher_c.clone()],
                    });
                }
            }
        }
    }
}

// 檢查教師是否希望調往特定縣市和區域
fn wants_location(from_teacher: &Teacher, to_teacher: &Teacher) -> bool {
    // 同一年度的教師才能互調
    if from_teacher.year != to_teacher.year {
        return false;
    }
    
    // 檢查縣市與區域是否符合
    for (i, county) in from_teacher.target_counties.iter().enumerate() {
        if county == &to_teacher.current_county && 
           i < from_teacher.target_districts.len() && 
           from_teacher.target_districts[i] == to_teacher.current_district {
            return true;
        }
    }
    
    false
}

// 移除重複的循環
fn remove_duplicate_cycles(results: Vec<MatchResult>) -> Vec<MatchResult> {
    let mut unique_results = Vec::new();
    let mut seen_cycles = HashSet::new();
    
    for result in results {
        let cycle_key = create_cycle_key(&result.teachers);
        
        if !seen_cycles.contains(&cycle_key) {
            unique_results.push(result);
            seen_cycles.insert(cycle_key);
        }
    }
    
    unique_results
}

// 創建一個表示循環的唯一標識
fn create_cycle_key(teachers: &[Teacher]) -> String {
    // 獲取所有教師的 ID
    let ids: Vec<String> = teachers
        .iter()
        .map(|t| t.id.unwrap_or(0).to_string())
        .collect();
    
    if ids.is_empty() {
        return "empty".to_string();
    }
    
    // 找到最小的 ID 及其位置
    let min_id = ids.iter().min().unwrap();
    let min_pos = ids.iter().position(|id| id == min_id).unwrap();
    
    // 從最小 ID 開始重新排列
    let mut rotated_ids = Vec::with_capacity(ids.len());
    for i in 0..ids.len() {
        rotated_ids.push(ids[(min_pos + i) % ids.len()].clone());
    }
    
    // 連接成字符串
    rotated_ids.join("-")
}