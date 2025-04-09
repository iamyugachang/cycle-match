import { useEffect, useState, useRef } from "react";
import { fetchLocations, getAllCounties, getDistrictsByCounty } from "../utils";

interface LocationSelectorProps {
  defaultCounty?: string;
  defaultDistrict?: string;
  onCountyChange: (county: string) => void;
  onDistrictChange: (district: string) => void;
  className?: string;
  required?: boolean;
  layout?: "vertical" | "horizontal"; // Add layout option
  label: {
    county: string;
    district: string;
  };
}

const LocationSelector: React.FC<LocationSelectorProps> = ({
  defaultCounty = "",
  defaultDistrict = "",
  onCountyChange,
  onDistrictChange,
  className = "",
  required = false,
  layout = "vertical", // Default to vertical layout
  label
}) => {
  const [locations, setLocations] = useState<any[]>([]);
  const [counties, setCounties] = useState<string[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [selectedCounty, setSelectedCounty] = useState(defaultCounty || "");
  const [selectedDistrict, setSelectedDistrict] = useState(defaultDistrict || "");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Define a ref to track first render - fixed to use the imported useRef
  const isFirstRender = useRef(true);
  
  // Fetch location data on component mount
  useEffect(() => {
    const getLocations = async () => {
      setIsLoading(true);
      
      try {
        const data = await fetchLocations();
        setLocations(data);
        
        const allCounties = getAllCounties(data);
        setCounties(allCounties);
        
        // If we have a default county, load its districts
        if (defaultCounty && allCounties.includes(defaultCounty)) {
          console.log("LocationSelector: Setting initial county from props:", defaultCounty);
          setSelectedCounty(defaultCounty);
          
          const countyDistricts = getDistrictsByCounty(data, defaultCounty);
          setDistricts(countyDistricts);
          
          // If we have a default district, select it if it exists
          if (defaultDistrict && countyDistricts.includes(defaultDistrict)) {
            setSelectedDistrict(defaultDistrict);
          }
        }
      } catch (err) {
        setError("獲取縣市區域資料失敗");
        console.error("獲取縣市區域資料失敗:", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    getLocations();
  }, []); // Only run on mount
  
  // Sync with props when they change
  useEffect(() => {
    // Skip first render as it's handled by the mount effect
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    
    if (defaultCounty && defaultCounty !== selectedCounty) {
      console.log("LocationSelector: Updating county from props change:", defaultCounty);
      setSelectedCounty(defaultCounty);
      
      if (locations.length > 0) {
        const countyDistricts = getDistrictsByCounty(locations, defaultCounty);
        setDistricts(countyDistricts);
        
        // Also update district if provided
        if (defaultDistrict && countyDistricts.includes(defaultDistrict)) {
          setSelectedDistrict(defaultDistrict);
        } else {
          setSelectedDistrict("");
        }
      }
    }
  }, [defaultCounty, defaultDistrict, locations, selectedCounty]);
  
  const handleCountyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const county = e.target.value;
    console.log("LocationSelector: county selected:", county);
    
    // Update local state first
    setSelectedCounty(county);
    
    // Update districts based on selected county
    const countyDistricts = getDistrictsByCounty(locations, county);
    setDistricts(countyDistricts);
    
    // Reset district selection
    setSelectedDistrict("");
    onDistrictChange("");
    
    // Notify parent component about the change
    onCountyChange(county);
  };
  
  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const district = e.target.value;
    setSelectedDistrict(district);
    onDistrictChange(district);
  };
  
  if (isLoading) {
    return <div>載入中...</div>;
  }
  
  if (error) {
    return <div style={{ color: "red" }}>{error}</div>;
  }
  
  return (
    <div className={`location-selector ${className}`}>
      <div style={{
        display: layout === "horizontal" ? "flex" : "block",
        gap: layout === "horizontal" ? "15px" : "0",
        flexWrap: "wrap"
      }}>
        <div className="county-selector" style={{ 
          flex: layout === "horizontal" ? "1" : undefined,
          minWidth: layout === "horizontal" ? "200px" : undefined,
          marginBottom: layout === "vertical" ? "10px" : "0"
        }}>
          <label htmlFor="county" style={{ display: "block", marginBottom: "5px" }}>
            {label.county}
          </label>
          <select
            id="county"
            value={selectedCounty}
            onChange={handleCountyChange}
            required={required}
            style={{
              width: "100%",
              padding: "8px",
              border: "1px solid #ddd",
              borderRadius: "4px",
              backgroundColor: "#fff"
            }}
          >
            <option value="">請選擇縣市</option>
            {counties.map(county => (
              <option key={county} value={county}>
                {county}
              </option>
            ))}
          </select>
          
          {/* Debug display for selected value */}
          <input 
            type="hidden" 
            name="debug_county" 
            value={selectedCounty} 
          />
        </div>
        
        <div className="district-selector" style={{ 
          flex: layout === "horizontal" ? "1" : undefined,
          minWidth: layout === "horizontal" ? "200px" : undefined
        }}>
          <label htmlFor="district" style={{ display: "block", marginBottom: "5px" }}>
            {label.district}
          </label>
          <select
            id="district"
            value={selectedDistrict}
            onChange={handleDistrictChange}
            disabled={!selectedCounty}
            required={required}
            style={{
              width: "100%",
              padding: "8px",
              border: "1px solid #ddd",
              borderRadius: "4px",
              backgroundColor: selectedCounty ? "#fff" : "#f5f5f5"
            }}
          >
            <option value="">請選擇區域</option>
            {districts.map(district => (
              <option key={district} value={district}>
                {district}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default LocationSelector;