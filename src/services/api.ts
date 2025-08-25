import axios from 'axios';

const API_BASE_URL = 'https://localhost:7060/api';

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
  // Üretim girişi oluştur (photo ile)
  createEntry: async (entry: ProductionEntryDto, photo?: File): Promise<ProductionEntry> => {
    if (photo) {
      // Foto varsa FormData kullan
      const formData = new FormData();
      
      // Her bir field'ı ayrı ayrı append et
      Object.keys(entry).forEach(key => {
        const value = entry[key as keyof ProductionEntryDto];
        if (value !== undefined && value !== null) {
          formData.append(key, value.toString());
        }
      });
      
      formData.append('photo', photo);

      console.log('API call with FormData and photo');
      const response = await api.post('/production/entries', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } else {
      // Foto yoksa normal JSON gönder
      console.log('API call with JSON (no photo)');
      const response = await api.post('/production/entries', entry);
      return response.data;
    }
  },

  // Tüm üretim girişlerini getir
  getAllEntries: async (): Promise<ProductionEntry[]> => {
    const response = await api.get('/production/entries');
    return response.data;
  },

  // Belirli bir üretim girişini getir
  getEntryById: async (id: number): Promise<ProductionEntry> => {
    const response = await api.get(`/production/entries/${id}`);
    return response.data;
  },

  // Görüntüleme için read-only veri getir
  getEntryForView: async (id: number): Promise<ProductionEntry> => {
    const response = await api.get(`/production/entries/${id}/view`);
    return response.data;
  },

  // Tarih aralığına göre üretim girişlerini getir
  getEntriesByDateRange: async (startDate: string, endDate: string, filterBy: string = 'date'): Promise<ProductionEntry[]> => {
    const response = await api.get(`/production/entries/date-range?startDate=${startDate}&endDate=${endDate}&filterBy=${filterBy}`);
    return response.data;
  },

  // Mevcut özeti getir
  getCurrentSummary: async (): Promise<ProductionSummary> => {
    const response = await api.get('/production/summary');
    return response.data;
  },

  // Özeti yeniden hesapla
  calculateSummary: async (): Promise<ProductionSummary> => {
    const response = await api.post('/production/summary/calculate');
    return response.data;
  },

  // Photo URL oluştur
  getPhotoUrl: (photoPath: string): string => {
    // Eğer photoPath zaten /uploads/ ile başlıyorsa başına tekrar ekleme
    if (photoPath.startsWith('/uploads/')) {
      return `${API_BASE_URL.replace('/api', '')}${photoPath}`;
    }
    // Sadece dosya adı gelirse eski davranış
    return `${API_BASE_URL.replace('/api', '')}/uploads/production-photos/${photoPath}`;
  },
};
