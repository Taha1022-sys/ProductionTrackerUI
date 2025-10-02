import axios from 'axios';

const API_BASE_URL ='https://production-tracker-taha-aee2bubdg9hyg9g6.francecentral-01.azurewebsites.net/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  return config;
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
  sampleFormCount: number;
  repeatFormCount: number;
  yesterdayRemainingCount: number;
  unmatchedProductCount: number;
  aQualityProductCount: number;
  threadedProductCount: number;
  stainedProductCount: number;
  measurementError: number;
  knittingError: number;
  toeDefect: number;
  otherDefect: number;
  totalDefects: number;
  remainingOnTableCount?: number;
  countTakenFromTable: number;
  countTakenFromMachine: number;
  measurementErrorRate: number;
  knittingErrorRate: number;
  toeDefectRate: number;
  otherDefectRate: number;
  generalErrorRate: number;
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
  sampleFormCount: number;
  repeatFormCount: number;
  yesterdayRemainingCount: number;
  unmatchedProductCount: number;
  aQualityProductCount: number;
  threadedProductCount: number;
  stainedProductCount: number;
  measurementError: number;
  knittingError: number;
  toeDefect: number;
  otherDefect: number;
  remainingOnTableCount?: number;
  countTakenFromTable: number;
  countTakenFromMachine: number;
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
  sampleFormCount: number;
  repeatFormCount: number;
  yesterdayRemainingCount: number;
  unmatchedProductCount: number;
  aQualityProductCount: number;
  threadedProductCount: number;
  stainedProductCount: number;
  measurementError: number;
  knittingError: number;
  toeDefect: number;
  otherDefect: number;
  remainingOnTableCount?: number;
  countTakenFromTable: number;
  countTakenFromMachine: number;
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
  remainingOnTableCount?: number;
  remainingOnTableCountDozen?: number;
  countTakenFromTable?: number;
  countTakenFromTableDozen?: number;
  countTakenFromMachine?: number;
  countTakenFromMachineDozen?: number;
  calculatedAt: string;
}

// Backend'den gelen sayfalı veri yapısı
export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

// Backend'den gelen özet liste yapısı
export interface ProductionEntrySummary {
  id: number;
  date: string;
  machineNo: string;
  shift: number;
  modelNo: number;
  totalPackages: number;
  generalErrorRate: number;
  createdAt: string;
}

// Backend'den gelen istatistik yapısı
export interface ProductionStatistics {
  totalEntries: number;
  averageErrorRate: number;
  topMachines: Array<{ machineNo: string; count: number }>;
  monthlyProduction: Array<{ month: string; count: number }>;
}

export const productionApi = {
  createEntry: async (entry: ProductionEntryDto): Promise<ProductionEntry> => {
    console.log('API createEntry - URL:', `${API_BASE_URL}/production/entries`);
    console.log('API createEntry - Entry data:', entry);
    try {
      const response = await api.post('/production/entries', entry);
      console.log('API createEntry - Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('API createEntry - Error:', error);
      throw error;
    }
  },

  updateEntry: async (id: number, entry: ProductionEntryUpdateDto): Promise<ProductionEntry> => {
    console.log('API update call with JSON');
    console.log('Entry data:', entry);
    const response = await api.put(`/production/entries/${id}`, entry);
    return response.data;
  },

  checkEditability: async (id: number): Promise<EditabilityCheckDto> => {
    const response = await api.get(`/production/entries/${id}/editability`);
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

  getCurrentSummary: async (): Promise<ProductionSummary> => {
    const response = await api.get('/production/summary');
    return response.data;
  },

  calculateSummary: async (): Promise<ProductionSummary> => {
    const response = await api.post('/production/summary/calculate');
    return response.data;
  },

  // Yeni Backend API Endpoint'leri

  // Sayfalı veri listeleme - HATA ÇÖZÜMÜ: shift parametresi string olarak tanımlandı
  getEntries: async (
    page: number = 1,
    pageSize: number = 10,
    machineNo?: string,
    shift?: string,  // number'dan string'e değiştirildi
    startDate?: string,
    endDate?: string
  ): Promise<PaginatedResponse<ProductionEntry>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString()
    });
    
    console.log('API getEntries - Parameters:', { machineNo, shift, startDate, endDate });
    
    if (machineNo) params.append('machineNo', machineNo);
    if (shift) params.append('shift', shift);  // artık .toString() gerekmez
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    console.log('API getEntries - URL:', `${API_BASE_URL}/production/entries?${params.toString()}`);
    
    try {
      const response = await api.get(`/production/entries?${params.toString()}`);
      console.log('API getEntries - Response:', response.data);
      
      // Backend'den gelen response format'ını frontend format'ına dönüştür
      if (response.data.data && response.data.pagination) {
        const result = {
          items: response.data.data,
          totalCount: response.data.pagination.totalCount,
          pageNumber: response.data.pagination.currentPage,
          pageSize: response.data.pagination.pageSize,
          totalPages: response.data.pagination.totalPages
        };
        console.log('API getEntries - Formatted result:', result);
        return result;
      }
      
      return response.data;
    } catch (error) {
      console.error('API getEntries - Error:', error);
      throw error;
    }
  },

  // Özet liste
  getEntriesSummary: async (): Promise<ProductionEntrySummary[]> => {
    const response = await api.get('/production/entries/summary');
    return response.data;
  },

  // İstatistikler
  getStatistics: async (): Promise<ProductionStatistics> => {
    const response = await api.get('/production/statistics');
    return response.data;
  },

  // Makine listesi
  getMachines: async (): Promise<string[]> => {
    const response = await api.get('/production/machines');
    return response.data;
  },

  // Excel dosyasını indir
  downloadExcel: async (): Promise<Blob> => {
    const response = await api.get('/production/entries/export/excel', {
      responseType: 'blob'
    });
    return response.data;
  },

  // Excel dosyasının konumunu öğren
  getExcelPath: async (): Promise<{ path: string }> => {
    const response = await api.get('/production/entries/excel-path');
    return response.data;
  },
};
