use crate::model::{Teacher, MatchResult};
use std::collections::{HashSet, HashMap};

pub fn find_matches(teachers: Vec<Teacher>) -> Vec<MatchResult> {
    let mut results = Vec::new();
    
    // 按年份分組
    let teachers_by_year = group_teachers_by_year(&teachers);
    
    // 對每個年份進行配對
    for (_year, year_teachers) in teachers_by_year {
        // 建立教師意願鄰接圖
        let preference_graph = build_preference_graph(&year_teachers);
        
        // 尋找循環圖 (從2人到10人)
        for cycle_size in 2..=10 {
            find_cycles(&year_teachers, &preference_graph, cycle_size, &mut results);
        }
    }
    
    // 去除重複的循環
    results = remove_duplicate_cycles(results);
    
    results
}

// 將教師按年份分組
fn group_teachers_by_year(teachers: &[Teacher]) -> HashMap<i32, Vec<Teacher>> {
    let mut groups = HashMap::new();
    for teacher in teachers {
        groups.entry(teacher.year)
            .or_insert_with(Vec::new)
            .push(teacher.clone());
    }
    groups
}

// 構建教師偏好的有向圖
// 返回的是一個映射：教師索引 -> 他期望調去的教師索引列表
fn build_preference_graph(teachers: &[Teacher]) -> HashMap<usize, Vec<usize>> {
    let mut graph = HashMap::new();
    
    for (i, from_teacher) in teachers.iter().enumerate() {
        let mut preferences = Vec::new();
        
        for (j, to_teacher) in teachers.iter().enumerate() {
            if i != j && wants_location(from_teacher, to_teacher) {
                preferences.push(j);
            }
        }
        
        graph.insert(i, preferences);
    }
    
    graph
}

// 檢查教師是否希望調往特定縣市和區域
fn wants_location(from_teacher: &Teacher, to_teacher: &Teacher) -> bool {
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

// 查找指定大小的循環
fn find_cycles(
    teachers: &[Teacher], 
    graph: &HashMap<usize, Vec<usize>>, 
    cycle_size: usize, 
    results: &mut Vec<MatchResult>
) {
    if teachers.len() < cycle_size {
        return;
    }
    
    // 使用回溯法尋找所有特定大小的循環
    let mut visited = vec![false; teachers.len()];
    let mut path = Vec::with_capacity(cycle_size);
    
    // 從每個教師開始嘗試尋找循環
    for start in 0..teachers.len() {
        // 重置訪問狀態
        visited.fill(false);
        path.clear();
        
        // 開始回溯
        dfs_find_cycle(
            teachers, 
            graph, 
            start, 
            start, 
            cycle_size, 
            &mut visited, 
            &mut path, 
            results
        );
    }
}

// 深度優先搜索尋找循環
fn dfs_find_cycle(
    teachers: &[Teacher],
    graph: &HashMap<usize, Vec<usize>>, 
    start: usize,
    current: usize,
    cycle_size: usize,
    visited: &mut [bool],
    path: &mut Vec<usize>,
    results: &mut Vec<MatchResult>
) {
    // 添加當前節點到路徑
    path.push(current);
    visited[current] = true;
    
    // 如果達到目標長度，檢查是否可以回到起點
    if path.len() == cycle_size {
        if let Some(neighbors) = graph.get(&current) {
            if neighbors.contains(&start) {
                // 找到一個有效的循環
                let cycle_teachers = path.iter()
                    .map(|&idx| teachers[idx].clone())
                    .collect::<Vec<_>>();
                
                results.push(MatchResult {
                    match_type: if cycle_size == 2 { 
                        "direct_swap".to_string() 
                    } else if cycle_size == 3 {
                        "triangle_swap".to_string()
                    } else {
                        format!("{}_swap", cycle_size)
                    },
                    teachers: cycle_teachers,
                });
            }
        }
    } else {
        // 繼續探索
        if let Some(neighbors) = graph.get(&current) {
            for &next in neighbors {
                if !visited[next] {
                    dfs_find_cycle(
                        teachers, 
                        graph, 
                        start, 
                        next, 
                        cycle_size, 
                        visited, 
                        path, 
                        results
                    );
                }
            }
        }
    }
    
    // 回溯：移除當前節點
    path.pop();
    visited[current] = false;
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