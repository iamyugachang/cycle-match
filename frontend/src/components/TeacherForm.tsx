"use client";

import { useState, useEffect, FormEvent } from "react";
import { Teacher } from "../types";

interface TeacherFormProps {
  onSubmit: (teacher: Teacher) => void;
  defaultEmail?: string;
}

const TeacherForm: React.FC<TeacherFormProps> = ({ onSubmit, defaultEmail = "" }) => {
  const [formData, setFormData] = useState<Teacher>({
    id: undefined,
    email: defaultEmail,
    current_county: "",
    current_district: "",
    current_school: "",
    target_counties: [""],
    target_districts: [""],
    subject: "",
    display_id: "",
    google_id: undefined,
    year: new Date().getFullYear() - 1911 // 預設為當前民國年
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleTargetChange = (index: number, field: "target_counties" | "target_districts", value: string) => {
    const updatedTargets = [...formData[field]];
    updatedTargets[index] = value;
    
    setFormData({ ...formData, [field]: updatedTargets });
  };

  const addTarget = () => {
    setFormData({
      ...formData,
      target_counties: [...formData.target_counties, ""],
      target_districts: [...formData.target_districts, ""]
    });
  };

  const removeTarget = (index: number) => {
    const updatedCounties = [...formData.target_counties];
    const updatedDistricts = [...formData.target_districts];
    
    updatedCounties.splice(index, 1);
    updatedDistricts.splice(index, 1);
    
    setFormData({
      ...formData,
      target_counties: updatedCounties,
      target_districts: updatedDistricts
    });
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    // Remove any empty target pairs
    const cleanCounties = formData.target_counties.filter(county => county.trim() !== "");
    const cleanDistricts = formData.target_districts.filter(district => district.trim() !== "");
    
    // Calculate the minimum length to avoid index out of bounds
    const minLength = Math.min(cleanCounties.length, cleanDistricts.length);
    
    const submissionData = {
      ...formData,
      target_counties: cleanCounties.slice(0, minLength),
      target_districts: cleanDistricts.slice(0, minLength)
    };
    
    onSubmit(submissionData);
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: "calc(100% - 20px)", margin: "0 auto" }}>
      <div style={{ marginBottom: "20px" }}>
        <label htmlFor="email" style={{ display: "block", marginBottom: "5px" }}>
          電子郵件
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="例如：example@example.com"
          style={{
            width: "100%",
            padding: "8px",
            border: "1px solid #ddd",
            borderRadius: "4px"
          }}
          required
        />
        <small style={{ color: "#666", marginTop: "4px", display: "block" }}>
          用於教師間聯絡，並顯示給配對成功的教師
        </small>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <label htmlFor="subject" style={{ display: "block", marginBottom: "5px" }}>
          任教科目
        </label>
        <input
          type="text"
          id="subject"
          name="subject"
          value={formData.subject}
          onChange={handleChange}
          placeholder="例如：一般、數學、美術"
          style={{
            width: "100%",
            padding: "8px",
            border: "1px solid #ddd",
            borderRadius: "4px"
          }}
          required
        />
      </div>

      <h3 style={{ marginBottom: "15px" }}>現職學校</h3>
      <div style={{ display: "flex", gap: "25px", marginBottom: "20px" }}>
        <div style={{ flex: 1 }}>
          <label htmlFor="current_county" style={{ display: "block", marginBottom: "5px" }}>
            縣市
          </label>
          <input
            type="text"
            id="current_county"
            name="current_county"
            value={formData.current_county}
            onChange={handleChange}
            placeholder="台北市、新北市等"
            style={{
              width: "100%",
              padding: "8px",
              border: "1px solid #ddd",
              borderRadius: "4px"
            }}
            required
          />
        </div>
        <div style={{ flex: 1 }}>
          <label htmlFor="current_district" style={{ display: "block", marginBottom: "5px" }}>
            區域
          </label>
          <input
            type="text"
            id="current_district"
            name="current_district"
            value={formData.current_district}
            onChange={handleChange}
            placeholder="例如：大安區、板橋區、南屯區"
            style={{
              width: "100%",
              padding: "8px",
              border: "1px solid #ddd",
              borderRadius: "4px"
            }}
            required
          />
        </div>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <label htmlFor="current_school" style={{ display: "block", marginBottom: "5px" }}>
          學校名稱
        </label>
        <input
          type="text"
          id="current_school"
          name="current_school"
          value={formData.current_school}
          onChange={handleChange}
          placeholder="例如：大安國小、板橋國小"
          style={{
            width: "100%",
            padding: "8px",
            border: "1px solid #ddd",
            borderRadius: "4px"
          }}
          required
        />
      </div>

      <h3 style={{ marginBottom: "15px" }}>希望調往地區</h3>
      {formData.target_counties.map((county, index) => (
        <div 
          key={index} 
          style={{ marginBottom: "15px", position: "relative" }}
          className={index > 0 ? "target-row additional-row" : "target-row"}
        >
          <div style={{ display: "flex", gap: "25px" }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", marginBottom: "5px" }}>
                縣市 {index + 1}
              </label>
              <input
                type="text"
                value={county}
                onChange={(e) => handleTargetChange(index, "target_counties", e.target.value)}
                placeholder="例如：台北市、台中市"
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "1px solid #ddd",
                  borderRadius: "4px"
                }}
                required
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", marginBottom: "5px" }}>
                區域 {index + 1}
              </label>
              <input
                type="text"
                value={formData.target_districts[index] || ""}
                onChange={(e) => handleTargetChange(index, "target_districts", e.target.value)}
                placeholder="例如：大安區、中壢區"
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "1px solid #ddd",
                  borderRadius: "4px"
                }}
                required
              />
            </div>
          </div>
          {index > 0 && (
            <button
              type="button"
              onClick={() => removeTarget(index)}
              style={{
                padding: "8px 12px",
                backgroundColor: "#dc3545",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                position: "absolute",
                right: "-5px",
                bottom: "0",
                opacity: 0,
                pointerEvents: "none",
                zIndex: 10,
              }}
              className="remove-button"
            >
              移除
            </button>
          )}
          <style jsx>{`
            .additional-row {
              padding-right: 0;
              transition: padding-right 0.3s ease;
            }
            .additional-row:hover {
              padding-right: 70px;
            }
            .additional-row:hover .remove-button {
              opacity: 1;
              pointer-events: auto !important;
              animation: fadeIn 0.3s ease forwards;
            }
            @keyframes fadeIn {
              from {
                opacity: 0;
                transform: translateX(-10px);
              }
              to {
                opacity: 1;
                transform: translateX(0);
              }
            }
          `}</style>
        </div>
      ))}

      <div style={{ marginBottom: "30px" }}>
        <button
          type="button"
          onClick={addTarget}
          style={{
            padding: "6px 12px",
            backgroundColor: "#6c757d",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer"
          }}
        >
          + 新增希望調往的地區
        </button>
      </div>

      <div>
        <button
          type="submit"
          style={{
            padding: "10px 16px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: "bold",
            width: "100%"
          }}
        >
          送出介聘資料
        </button>
      </div>
    </form>
  );
};

export default TeacherForm;