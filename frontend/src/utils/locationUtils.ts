interface District {
    zip: string;
    name: string;
  }
  
  interface County {
    name: string;
    districts: District[];
  }
  
  // 獲取縣市區域資料
  export const fetchLocations = async (): Promise<County[]> => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/districts`);
      
      if (!response.ok) {
        throw new Error(`獲取縣市區域資料失敗: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error("獲取縣市區域資料錯誤:", error);
      return [];
    }
  };
  
  // 獲取所有縣市名稱
  export const getAllCounties = (locations: County[]): string[] => {
    return locations.map(county => county.name);
  };
  
  // 根據縣市名稱獲取其所有區域
  export const getDistrictsByCounty = (locations: County[], countyName: string): string[] => {
    const county = locations.find(c => c.name === countyName);
    return county ? county.districts.map(d => d.name) : [];
  };
  
  // 檢查縣市是否存在
  export const isValidCounty = (locations: County[], countyName: string): boolean => {
    return locations.some(county => county.name === countyName);
  };
  
  // 檢查區域是否存在於指定縣市中
  export const isValidDistrict = (locations: County[], countyName: string, districtName: string): boolean => {
    const county = locations.find(c => c.name === countyName);
    return county ? county.districts.some(d => d.name === districtName) : false;
  };