use crate::model::{Teacher, MatchResult};
use std::collections::{HashSet, HashMap};
use itertools::Itertools;

pub fn find_matches(teachers: Vec<Teacher>) -> Vec<MatchResult> {
    let mut results = Vec::new();
    
    // Group teachers by year
    let teachers_by_year = group_teachers_by_year(&teachers);
    
    // Group by subject within each year
    for (_year, year_teachers) in teachers_by_year {
        let teachers_by_subject = group_teachers_by_subject(&year_teachers);
        
        // Find matches for each subject group
        for (_subject, subject_teachers) in teachers_by_subject {
            // Build the preference graph
            let preference_graph = build_preference_graph(&subject_teachers);
            
            // Find cycles of each size
            for cycle_size in 2..=10 {
                find_cycles(&subject_teachers, &preference_graph, cycle_size, &mut results);
            }
        }
    }
    
    // Remove duplicate cycles first
    results = remove_duplicate_cycles(results);
    
    // Then filter redundant permutations
    results = filter_redundant_permutations(results);
    
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

// 將教師按科目分組
fn group_teachers_by_subject(teachers: &[Teacher]) -> HashMap<String, Vec<Teacher>> {
    let mut groups = HashMap::new();
    for teacher in teachers {
        // 使用小寫並去除空白，增加匹配機會
        let normalized_subject = teacher.subject.to_lowercase().trim().to_string();
        if !normalized_subject.is_empty() {
            groups.entry(normalized_subject)
                .or_insert_with(Vec::new)
                .push(teacher.clone());
        } else {
            // 對於沒有填寫科目的教師，使用特殊標識
            groups.entry("未指定".to_string())
                .or_insert_with(Vec::new)
                .push(teacher.clone());
        }
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
    // 檢查縣市是否相同，相同縣市不允許匹配
    if from_teacher.current_county == to_teacher.current_county {
        return false;
    }
    
    // 檢查縣市與區域是否符合教師的調動志願
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
    
    // Use a different approach for tracking seen cycles that considers teacher IDs
    let mut seen_cycles = HashSet::new();
    
    // Use backtracking to find all possible cycles
    let mut visited = vec![false; teachers.len()];
    let mut path = Vec::with_capacity(cycle_size);
    
    // Start from each teacher
    for start in 0..teachers.len() {
        // Reset visited array
        visited.fill(false);
        path.clear();
        
        // Start DFS
        dfs_find_cycle_with_ids(
            teachers, 
            graph, 
            start, 
            start, 
            cycle_size, 
            &mut visited, 
            &mut path, 
            results,
            &mut seen_cycles
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

fn dfs_find_cycle_with_ids(
    teachers: &[Teacher],
    graph: &HashMap<usize, Vec<usize>>, 
    start: usize,
    current: usize,
    cycle_size: usize,
    visited: &mut [bool],
    path: &mut Vec<usize>,
    results: &mut Vec<MatchResult>,
    seen_cycles: &mut HashSet<String>
) {
    // Add current node to path
    path.push(current);
    visited[current] = true;
    
    // If we've reached the target cycle size
    if path.len() == cycle_size {
        if let Some(neighbors) = graph.get(&current) {
            if neighbors.contains(&start) {
                // Create a unique identifier for this specific cycle using teacher IDs
                let cycle_ids: Vec<String> = path.iter()
                    .map(|&idx| teachers[idx].id.unwrap_or(0).to_string())
                    .collect();
                
                // Add the start node ID to close the cycle (for uniqueness checking)
                let mut full_cycle = cycle_ids.clone();
                full_cycle.push(teachers[start].id.unwrap_or(0).to_string());
                
                // Create a canonical representation for uniqueness checking
                let min_pos = (0..cycle_size)
                    .min_by_key(|&i| &full_cycle[i])
                    .unwrap_or(0);
                
                let mut canonical_cycle = Vec::with_capacity(cycle_size);
                for i in 0..cycle_size {
                    canonical_cycle.push(full_cycle[(min_pos + i) % cycle_size].clone());
                }
                
                let cycle_key = canonical_cycle.join("-");
                
                // If we haven't seen this exact teacher combination before
                if !seen_cycles.contains(&cycle_key) {
                    // Build the match result
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
                    
                    // Mark this cycle as seen
                    seen_cycles.insert(cycle_key);
                }
            }
        }
    } else {
        // Continue exploring
        if let Some(neighbors) = graph.get(&current) {
            for &next in neighbors {
                if !visited[next] {
                    dfs_find_cycle_with_ids(
                        teachers, 
                        graph, 
                        start, 
                        next, 
                        cycle_size, 
                        visited, 
                        path, 
                        results,
                        seen_cycles
                    );
                }
            }
        }
    }
    
    // Backtrack
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
    if teachers.is_empty() {
        return "empty".to_string();
    }
    
    // Group teachers by current location
    let mut location_groups: HashMap<String, Vec<String>> = HashMap::new();
    
    for teacher in teachers {
        let location_key = format!("{}-{}", teacher.current_county, teacher.current_district);
        location_groups.entry(location_key)
            .or_insert_with(Vec::new)
            .push(teacher.id.unwrap_or(0).to_string());
    }
    
    // Sort teacher IDs within each location group
    for ids in location_groups.values_mut() {
        ids.sort();
    }
    
    // Sort location keys
    let mut sorted_locations: Vec<String> = location_groups.keys().cloned().collect();
    sorted_locations.sort();
    
    // Build the key
    let mut key_parts = Vec::new();
    for loc in sorted_locations {
        if let Some(ids) = location_groups.get(&loc) {
            key_parts.push(format!("{}:[{}]", loc, ids.join(",")));
        }
    }
    
    key_parts.join("|")
}

fn filter_redundant_permutations(results: Vec<MatchResult>) -> Vec<MatchResult> {
    let mut unique_results = Vec::new();
    let mut seen_location_patterns = HashMap::new();
    
    // First, group by location pattern
    for result in results {
        // Create a pattern representing the locations in this match
        let mut locations: Vec<(String, String)> = result.teachers.iter()
            .map(|t| (t.current_county.clone(), t.current_district.clone()))
            .collect();
        
        // Sort locations to normalize the pattern
        locations.sort();
        let location_key = locations.iter()
            .map(|(county, district)| format!("{}-{}", county, district))
            .collect::<Vec<String>>()
            .join("|");
        
        // For each location pattern, keep one example of each teacher
        seen_location_patterns.entry(location_key)
            .or_insert_with(Vec::new)
            .push(result);
    }
    
    // For each location pattern, select representative matches
    for (_pattern, matches) in seen_location_patterns {
        // Group matches by the specific teachers involved
        let mut teacher_groups: HashMap<String, Vec<MatchResult>> = HashMap::new();
        
        for m in matches {
            // Create a key based on the teacher IDs at each position
            let mut teachers_by_location: HashMap<String, Vec<i32>> = HashMap::new();
            
            for t in &m.teachers {
                let loc_key = format!("{}-{}", t.current_county, t.current_district);
                teachers_by_location.entry(loc_key)
                    .or_insert_with(Vec::new)
                    .push(t.id.unwrap_or(0));
            }
            
            // Create a key representing the specific teachers at each location
            let mut teacher_keys: Vec<String> = Vec::new();
            for loc in teachers_by_location.keys().collect::<Vec<&String>>().iter().sorted() {
                let mut ids = teachers_by_location.get(*loc).unwrap().clone();
                ids.sort();
                teacher_keys.push(format!("{}:[{}]", loc, ids.iter().map(|id| id.to_string()).collect::<Vec<String>>().join(",")));
            }
            
            let teacher_key = teacher_keys.join("|");
            teacher_groups.entry(teacher_key)
                .or_insert_with(Vec::new)
                .push(m);
        }
        
        // Add one match from each teacher group to the results
        for (_key, group) in teacher_groups {
            if let Some(match_result) = group.into_iter().next() {
                unique_results.push(match_result);
            }
        }
    }
    
    unique_results
}