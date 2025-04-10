import { useState, useEffect, FormEvent } from "react";
import { Teacher } from "../types";
import LocationSelector from "./LocationSelector";
import { fetchSubjects } from "../utils/subjectUtils";

interface TeacherFormProps {
  onSubmit: (teacher: Teacher) => void;
  defaultEmail?: string;
}

const TeacherForm: React.FC<TeacherFormProps> = ({ onSubmit, defaultEmail = "" }) => {
  // 自動計算當前民國年份
  const currentYear = new Date().getFullYear() - 1911;
  
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
    year: currentYear // 預設為當前民國年
  });

  // Change this to only show validation errors after submission attempt
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);

  const [subjects, setSubjects] = useState<string[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  
  // Add state to track screen width for responsive design
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if we're on the client side before using window
    if (typeof window !== 'undefined') {
      // Set initial state
      setIsMobile(window.innerWidth < 768);
      
      // Handler to update state based on window size
      const handleResize = () => {
        setIsMobile(window.innerWidth < 768);
      };
      
      // Add event listener
      window.addEventListener('resize', handleResize);
      
      // Clean up
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  useEffect(() => {
    const loadSubjects = async () => {
      setLoadingSubjects(true);
      try {
        const subjectList = await fetchSubjects();
        setSubjects(subjectList);
      } catch (error) {
        console.error("Failed to fetch subjects:", error);
      } finally {
        setLoadingSubjects(false);
      }
    };
    loadSubjects();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCurrentCountyChange = (county: string) => {
    console.log("County selected in TeacherForm:", county); // Debug log
    
    // Set state with the county name directly
    setFormData(prevState => {
      const newState = {
        ...prevState,
        current_county: county
      };
      
      // Log inside the update callback to see the new state value
      console.log("New state county value:", newState.current_county);
      
      return newState;
    });
  };

  const handleCurrentDistrictChange = (district: string) => {
    setFormData({ ...formData, current_district: district });
  };

  const handleTargetCountyChange = (index: number, county: string) => {
    const updatedTargetCounties = [...formData.target_counties];
    updatedTargetCounties[index] = county;
    setFormData({ ...formData, target_counties: updatedTargetCounties });
  };

  const handleTargetDistrictChange = (index: number, district: string) => {
    const updatedTargetDistricts = [...formData.target_districts];
    updatedTargetDistricts[index] = district;
    setFormData({ ...formData, target_districts: updatedTargetDistricts });
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
    
    console.log("Current form data at submission:", formData);
    
    // Mark that submission was attempted for validation display
    setAttemptedSubmit(true);
    
    // Remove any empty target pairs
    const cleanCounties = formData.target_counties.filter(county => county.trim() !== "");
    const cleanDistricts = formData.target_districts.filter(district => district.trim() !== "");
    
    // Calculate the minimum length to avoid index out of bounds
    const minLength = Math.min(cleanCounties.length, cleanDistricts.length);
    
    // Make sure current_county is not empty
    if (!formData.current_county || formData.current_county.trim() === "") {
      console.warn("Current county is empty:", formData.current_county);
      // Return early to prevent submission if county is empty
      return;
    }
    
    const submissionData = {
      ...formData,
      target_counties: cleanCounties.slice(0, minLength),
      target_districts: cleanDistricts.slice(0, minLength)
    };
    
    // Log the data being submitted to help debug
    console.log("Submitting form data:", submissionData);
    
    onSubmit(submissionData);
  };

  // Define responsive styles
  const formStyles = {
    container: { 
      maxWidth: "100%", 
      margin: "0 auto",
      padding: isMobile ? "0 15px" : "0 20px" // Increased padding on mobile for better readability
    },
    formRow: { 
      display: "flex", 
      flexDirection: isMobile ? "column" as "column" : "row" as "row", 
      flexWrap: "wrap" as "wrap", 
      gap: isMobile ? "10px" : "15px", 
      marginBottom: isMobile ? "12px" : "15px" 
    },
    formColumn: { 
      flex: "1", 
      minWidth: isMobile ? "100%" : "250px" 
    },
    formGroup: { 
      marginBottom: isMobile ? "16px" : "12px" 
    },
    label: { 
      display: "block", 
      marginBottom: "5px", 
      fontSize: isMobile ? "16px" : "14px", // Larger font size on mobile
      fontWeight: "500" as "500"
    },
    input: {
      width: "100%",
      padding: isMobile ? "12px 10px" : "8px", // Larger touch target on mobile
      border: "1px solid #ddd",
      borderRadius: "4px",
      fontSize: isMobile ? "16px" : "14px", // Larger font on mobile for better readability
      WebkitAppearance: "none", // Remove iOS default styling
      appearance: "none"
    },
    inputReadOnly: {
      backgroundColor: "#f5f5f5"
    },
    helpText: { 
      color: "#666", 
      fontSize: isMobile ? "14px" : "12px", // Larger on mobile
      marginTop: "5px", 
      display: "block" 
    },
    section: { 
      margin: "20px 0 15px 0", 
      borderBottom: "1px solid #eee", 
      paddingBottom: "8px", 
      fontWeight: "bold" as "bold",
      fontSize: isMobile ? "18px" : "16px" // Larger headings on mobile
    },
    targetRow: {
      marginBottom: isMobile ? "20px" : "15px",
      position: "relative" as "relative",
      padding: isMobile ? "15px 10px" : "10px",
      border: "1px solid #eaeaea",
      borderRadius: "4px",
      backgroundColor: "#fafafa"
    },
    button: {
      padding: isMobile ? "12px 16px" : "8px 15px", // Larger touch target on mobile
      border: "none",
      borderRadius: "4px",
      cursor: "pointer",
      fontWeight: "500" as "500",
      fontSize: isMobile ? "16px" : "14px" // Larger text on buttons for mobile
    },
    addButton: {
      backgroundColor: "#6c757d",
      color: "white",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: "20px",
      width: isMobile ? "100%" : "auto" // Full width on mobile
    },
    removeButton: {
      padding: isMobile ? "8px 12px" : "5px 10px",
      backgroundColor: "#dc3545",
      color: "white",
      border: "none",
      borderRadius: "4px",
      cursor: "pointer",
      position: "absolute" as "absolute",
      right: "10px",
      top: "10px",
      fontSize: isMobile ? "14px" : "12px" // Larger for touch targets
    },
    submitButton: {
      backgroundColor: "#007bff",
      color: "white",
      padding: isMobile ? "15px 16px" : "10px 16px", // Taller button on mobile
      width: "100%",
      fontWeight: "bold" as "bold",
      marginTop: "20px",
      fontSize: isMobile ? "18px" : "16px" // Larger text for mobile
    },
    locationRow: { 
      display: "flex", 
      flexDirection: isMobile ? "column" as "column" : "row" as "row",
      gap: isMobile ? "12px" : "15px", 
      flexWrap: "wrap" as "wrap"
    },
    locationColumn: {
      flex: "1",
      minWidth: isMobile ? "100%" : "200px"
    }
  };

  return (
    <form onSubmit={handleSubmit} style={formStyles.container}>
      {/* Row 1: Current School Section Header */}
      <h3 style={formStyles.section}>現職學校</h3>
      
      {/* Row 2: County and District */}
      <div style={formStyles.formRow}>
        <div style={{...formStyles.formColumn, width: "100%"}}>
          <LocationSelector
            key={`location-${formData.current_county || 'empty'}`}
            defaultCounty={formData.current_county}
            defaultDistrict={formData.current_district}
            onCountyChange={handleCurrentCountyChange}
            onDistrictChange={handleCurrentDistrictChange}
            required={true}
            layout={isMobile ? "vertical" : "horizontal"} // Change to vertical layout on mobile
            label={{
              county: "縣市",
              district: "區域"
            }}
          />
          {attemptedSubmit && (!formData.current_county || formData.current_county.trim() === "") && (
            <p style={{ color: "red", marginTop: "5px", fontSize: isMobile ? "14px" : "12px" }}>
              請選擇縣市
            </p>
          )}
          
          <input 
            type="hidden" 
            name="current_county" 
            value={formData.current_county || ''} 
          />
        </div>
      </div>

      {/* Row 3: School Name and Subject - Make it more responsive */}
      <div style={formStyles.formRow}>
        <div style={{...formStyles.formColumn, width: "100%"}}>
          {/* Replace with a more directly comparable approach */}
          <div style={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row", // Stack vertically on mobile
            gap: isMobile ? "16px" : "30px", // Adjust spacing
            flexWrap: "wrap" as "wrap",
            width: "100%"  // Ensure full width like the LocationSelector
          }}>
            <div style={{
              flex: "1",
              minWidth: isMobile ? "100%" : "200px" // Full width on mobile
            }}>
              <label htmlFor="current_school" style={formStyles.label}>學校名稱</label>
              <input
                type="text"
                id="current_school"
                name="current_school"
                value={formData.current_school}
                onChange={handleChange}
                placeholder="例如：大安國小、板橋國小"
                style={formStyles.input}
                required
              />
            </div>
            
            <div style={{
              flex: "1",
              minWidth: isMobile ? "100%" : "200px" // Full width on mobile
            }}>
              <label htmlFor="subject" style={formStyles.label}>任教科目</label>
              <select
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                style={{
                  ...formStyles.input,
                  height: isMobile ? "48px" : "auto" // Make sure select is tall enough on mobile
                }}
                required
                disabled={loadingSubjects}
              >
                <option value="">請選擇科目</option>
                {subjects.map((subject) => (
                  <option key={subject} value={subject}>
                    {subject}
                  </option>
                ))}
              </select>
              {loadingSubjects && (
                <small style={formStyles.helpText}>載入中...</small>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Row 4: Target School Section Header */}
      <h3 style={formStyles.section}>希望調往地區</h3>
      <small style={formStyles.helpText}>請排志願序，演算法將依照此排序配對</small>
      
      {/* Row 5: Various Transfer Options - Fixed to properly show county options */}
      {formData.target_counties.map((county, index) => (
        <div 
          key={index} 
          style={formStyles.targetRow}
          className={index > 0 ? "target-row additional-row" : "target-row"}
        >
          <div>
            <h4 style={{ 
              margin: "0 0 8px 0", 
              fontSize: isMobile ? "16px" : "14px" 
            }}>調動選項 {index + 1}</h4>
            
            {/* Use the LocationSelector directly instead of trying to create a custom select */}
            <LocationSelector
              defaultCounty={county}
              defaultDistrict={formData.target_districts[index] || ""}
              onCountyChange={(county) => handleTargetCountyChange(index, county)}
              onDistrictChange={(district) => handleTargetDistrictChange(index, district)}
              required={true}
              layout={isMobile ? "vertical" : "horizontal"} // Change to vertical layout on mobile
              label={{
                county: `希望調往縣市`,
                district: `希望調往區域`
              }}
            />
          </div>
          
          {index > 0 && (
            <button
              type="button"
              onClick={() => removeTarget(index)}
              style={{
                ...formStyles.removeButton,
                // Position the button better on mobile
                ...(isMobile && {
                  top: "15px",
                  right: "15px",
                  padding: "10px 15px"
                })
              }}
            >
              移除
            </button>
          )}
        </div>
      ))}

      {/* Row 6: Add Target Area Button */}
      <button
        type="button"
        onClick={addTarget}
        style={{...formStyles.button, ...formStyles.addButton}}
      >
        <span style={{ marginRight: "5px" }}>+</span> 新增希望調往的地區
      </button>

      {/* Row 7: Email */}
      <div style={{...formStyles.formRow, marginTop: "20px"}}>
        <div style={{...formStyles.formColumn, width: "100%"}}>
          <div style={formStyles.formGroup}>
            <label htmlFor="email" style={formStyles.label}>電子郵件</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="例如：example@example.com"
              style={formStyles.input}
              required
            />
            <small style={formStyles.helpText}>僅供教師間聯絡，本站不會做任何用途</small>
          </div>
        </div>
      </div>

      <button
        type="submit"
        style={{...formStyles.button, ...formStyles.submitButton}}
      >
        送出介聘資料
      </button>
    </form>
  );
};

export default TeacherForm;