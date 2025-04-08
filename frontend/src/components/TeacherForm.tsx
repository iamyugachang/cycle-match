"use client";

import { useState, useEffect} from "react";

interface Teacher {
  id?: number;
  name?: string;            // 名稱字段變為可選
  display_id?: string;      // 顯示代號
  email: string;
  year: number;
  current_county: string;
  current_district: string;
  current_school: string;
  target_counties: string[];
  target_districts: string[];
}

interface TeacherFormProps {
  onSubmit: (teacher: Teacher) => void;
  defaultEmail?: string;
}

export default function TeacherForm({ onSubmit, defaultEmail }: TeacherFormProps) {
  const currentROCYear = new Date().getFullYear() - 1911;
  
  const [teacher, setTeacher] = useState<Teacher>({
    email: defaultEmail || "",
    year: currentROCYear,
    current_county: "",
    current_district: "",
    current_school: "",
    target_counties: [""],
    target_districts: [""]
  });

  useEffect(() => {
    if (defaultEmail) {
      setTeacher((prev) => ({ ...prev, email: defaultEmail }));
    }
  }, [defaultEmail]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTeacher({ ...teacher, [name]: value });
  };

  const handleTargetChange = (index: number, field: string, value: string) => {
    if (field === 'county') {
      const counties = [...teacher.target_counties];
      counties[index] = value;
      setTeacher({ ...teacher, target_counties: counties });
    } else {
      const districts = [...teacher.target_districts];
      districts[index] = value;
      setTeacher({ ...teacher, target_districts: districts });
    }
  };

  const addTargetLocation = () => {
    setTeacher({
      ...teacher,
      target_counties: [...teacher.target_counties, ""],
      target_districts: [...teacher.target_districts, ""]
    });
  };

  const removeTargetLocation = (index: number) => {
    // 不允許刪除最後一個志願
    if (teacher.target_counties.length <= 1) return;
    
    const newCounties = [...teacher.target_counties];
    const newDistricts = [...teacher.target_districts];
    
    newCounties.splice(index, 1);
    newDistricts.splice(index, 1);
    
    setTeacher({
      ...teacher,
      target_counties: newCounties,
      target_districts: newDistricts
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(teacher);
    setTeacher({
      email: defaultEmail || "",
      year: currentROCYear,
      current_county: "",
      current_district: "",
      current_school: "",
      target_counties: [""],
      target_districts: [""]
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ marginBottom: '10px' }}>
        <label style={{ display: 'block' }}>介聘年度:</label>
        <input
          type="number"
          name="year"
          value={teacher.year}
          onChange={handleChange}
          required
          style={{ width: '100%', padding: '5px' }}
        />
      </div>

      <div style={{ marginBottom: '10px' }}>
        <label style={{ display: 'block' }}>Email:</label>
        <input
          type="email"
          name="email"
          value={teacher.email}
          onChange={handleChange}
          required
          style={{ width: '100%', padding: '5px' }}
        />
      </div>

      <div style={{ marginBottom: '10px' }}>
        <label style={{ display: 'block' }}>目前縣/市:</label>
        <input
          type="text"
          name="current_county"
          value={teacher.current_county}
          onChange={handleChange}
          required
          style={{ width: '100%', padding: '5px' }}
        />
      </div>

      <div style={{ marginBottom: '10px' }}>
        <label style={{ display: 'block' }}>目前鄉鎮市/區:</label>
        <input
          type="text"
          name="current_district"
          value={teacher.current_district}
          onChange={handleChange}
          required
          style={{ width: '100%', padding: '5px' }}
        />
      </div>

      <div style={{ marginBottom: '10px' }}>
        <label style={{ display: 'block' }}>目前學校:</label>
        <input
          type="text"
          name="current_school"
          value={teacher.current_school}
          onChange={handleChange}
          required
          style={{ width: '100%', padding: '5px' }}
        />
      </div>

      <div style={{ marginBottom: '10px' }}>
        <label style={{ display: 'block' }}>希望調往地區:</label>
        {teacher.target_counties.map((county, index) => (
          <div key={index} style={{ display: 'flex', marginBottom: '5px', alignItems: 'center' }}>
            <span style={{ width: '20px', textAlign: 'right', marginRight: '5px' }}>{index + 1}.</span>
            <input
              type="text"
              placeholder="縣/市"
              value={county}
              onChange={(e) => handleTargetChange(index, 'county', e.target.value)}
              required
              style={{ flex: 1, padding: '5px' }}
            />
            <input
              type="text"
              placeholder="鄉鎮市/區"
              value={teacher.target_districts[index]}
              onChange={(e) => handleTargetChange(index, 'district', e.target.value)}
              required
              style={{ flex: 1, marginLeft: '5px', padding: '5px' }}
            />
            {teacher.target_counties.length > 1 && (
              <button 
                type="button"
                onClick={() => removeTargetLocation(index)}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  marginLeft: '5px',
                  padding: '0 5px',
                  fontSize: '16px',
                  color: '#dc3545'
                }}
                title="刪除此志願"
              >
                🗑️
              </button>
            )}
          </div>
        ))}
        <button 
          type="button" 
          onClick={addTargetLocation}
          style={{ padding: '5px', marginTop: '5px' }}
        >
          + 新增志願
        </button>
      </div>

      <button 
        type="submit"
        style={{ 
          backgroundColor: '#4CAF50', 
          color: 'white',
          border: 'none',
          padding: '10px',
          width: '100%',
          cursor: 'pointer',
          marginTop: '10px'
        }}
      >
        提交資料
      </button>
    </form>
  );
}