import axios from 'axios';

const API_BASE_URL = 'http://localhost:5197/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface ProductionEntry {
  id: number;
  date: string;
  machineNo: string;
  mkCycleSpeed: number;
  shift: number;
  moldNo: number;
  steam: number;
  formCount: number;
  matchingPersonnelCount: number;
  tablePersonnelCount: number;
  modelNo: number;
  sizeNo: string;
  itemsPerPackage: number;
  packagesPerBag?: number;
  bagsPerBox?: number;
  tableTotalPackage: number;
  measurementError: number;
  knittingError: number;
  toeDefect: number;
  otherDefect: number;
  totalDefects: number;
  remainingOnTableCount?: number;
  countTakenFromTable: number;
  measurementErrorRate: number;
  knittingErrorRate: number;
  toeDefectRate: number;
  otherDefectRate: number;
  generalErrorRate: number;
  photoPath?: string;
  createdAt: string;
  updatedAt?: string;
  canEdit?: boolean;
  timeRemainingForEdit?: string;
  editStatus?: string;
  note?: string;
}

export interface ProductionEntryDto {
  date: string;
  machineNo: string;
  mkCycleSpeed: number;
  shift: number;
  moldNo: number;
  steam: number;
  formCount: number;
  matchingPersonnelCount: number;
  tablePersonnelCount: number;
  modelNo: number;
  sizeNo: string;
  itemsPerPackage: number;
  packagesPerBag?: number;
  bagsPerBox?: number;
  tableTotalPackage: number;
  measurementError: number;
  knittingError: number;
  toeDefect: number;
  otherDefect: number;
  remainingOnTableCount?: number;
  countTakenFromTable: number;
}

export interface ProductionEntryUpdateDto {
  date: string;
  machineNo: string;
  mkCycleSpeed: number;
  shift: number;
  moldNo: number;
  steam: number;
  formCount: number;
  matchingPersonnelCount: number;
  tablePersonnelCount: number;
  modelNo: number;
  sizeNo: string;
  itemsPerPackage: number;
  packagesPerBag?: number;
  bagsPerBox?: number;
  tableTotalPackage: number;
  measurementError: number;
  knittingError: number;
  toeDefect: number;
  otherDefect: number;
  remainingOnTableCount?: number;
  countTakenFromTable: number;
  deleteCurrentPhoto?: boolean;
}

export interface EditabilityCheckDto {
  canEdit: boolean;
  timeRemainingForEdit: string;
  editStatus: string;
  timeRemainingInMinutes: number;
}

export interface ProductionSummary {
  id: number;
  totalTableCount: number;
  totalTableCountDozen: number;
  totalErrorCount: number;
  totalErrorCountDozen: number;
  measurementErrorCount: number;
  measurementErrorDozen: number;
  measurementErrorRate: number;
  knittingErrorCount: number;
  knittingErrorDozen: number;
  knittingErrorRate: number;
  toeDefectCount: number;
  toeDefectDozen: number;
  toeDefectRate: number;
  otherDefectCount: number;
  otherDefectDozen: number;
  otherDefectRate: number;
  overallErrorRate: number;
  calculatedAt: string;
}

export const productionApi = {
  createEntry: async (entry: ProductionEntryDto, photo?: File): Promise<ProductionEntry> => {
    const formData = new FormData();
    Object.keys(entry).forEach(key => {
      const value = entry[key as keyof ProductionEntryDto];
      if (value !== undefined && value !== null) {
        formData.append(key, value.toString());
      }
    });
    if (photo) {
      formData.append('photo', photo);
    }
    console.log('API call with FormData');
    const response = await api.post('/production/entries', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  updateEntry: async (id: number, entry: ProductionEntryUpdateDto, photo?: File): Promise<ProductionEntry> => {
    const formData = new FormData();
    Object.keys(entry).forEach(key => {
      const value = entry[key as keyof ProductionEntryUpdateDto];
      if (value !== undefined && value !== null) {
        formData.append(key, value.toString());
      }
    });
    if (photo) {
      formData.append('photo', photo);
    }
    console.log('API update call with FormData');
    const response = await api.put(`/production/entries/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  checkEditability: async (id: number): Promise<EditabilityCheckDto> => {
    const response = await api.get(`/production/entries/${id}/editability`);
    return response.data;
  },

  getAllEntries: async (): Promise<ProductionEntry[]> => {
    const response = await api.get('/production/entries');
    return response.data;
  },

  getEntryById: async (id: number): Promise<ProductionEntry> => {
    const response = await api.get(`/production/entries/${id}`);
    return response.data;
  },

  getEntryForView: async (id: number): Promise<ProductionEntry> => {
    const response = await api.get(`/production/entries/${id}/view`);
    return response.data;
  },

  getEntriesByDateRange: async (startDate: string, endDate: string, filterBy: string = 'date'): Promise<ProductionEntry[]> => {
    const response = await api.get(`/production/entries/date-range?startDate=${startDate}&endDate=${endDate}&filterBy=${filterBy}`);
    return response.data;
  },

  getCurrentSummary: async (): Promise<ProductionSummary> => {
    const response = await api.get('/production/summary');
    return response.data;
  },

  calculateSummary: async (): Promise<ProductionSummary> => {
    const response = await api.post('/production/summary/calculate');
    return response.data;
  },

  getPhotoUrl: (photoPath: string): string => {
    if (photoPath.startsWith('/uploads/')) {
      return `${API_BASE_URL.replace('/api', '')}${photoPath}`;
    }
    return `${API_BASE_URL.replace('/api', '')}/uploads/production-photos/${photoPath}`;
  },
};
