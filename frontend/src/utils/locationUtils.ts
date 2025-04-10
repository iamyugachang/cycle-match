import ApiService from '../services/ApiService';

interface District {
  zip: string;
  name: string;
}

interface County {
  name: string;
  districts: District[];
}

// Get location data using centralized ApiService
export const fetchLocations = async (): Promise<County[]> => {
  try {
    return await ApiService.getLocations();
  } catch (error) {
    console.error("獲取縣市區域資料錯誤:", error);
    return [];
  }
};

// Get all county names
export const getAllCounties = (locations: County[]): string[] => {
  return locations.map(county => county.name);
};

// Get districts by county name
export const getDistrictsByCounty = (locations: County[], countyName: string): string[] => {
  const county = locations.find(c => c.name === countyName);
  return county ? county.districts.map(d => d.name) : [];
};

// Check if county exists
export const isValidCounty = (locations: County[], countyName: string): boolean => {
  return locations.some(county => county.name === countyName);
};

// Check if district exists in specified county
export const isValidDistrict = (locations: County[], countyName: string, districtName: string): boolean => {
  const county = locations.find(c => c.name === countyName);
  return county ? county.districts.some(d => d.name === districtName) : false;
};