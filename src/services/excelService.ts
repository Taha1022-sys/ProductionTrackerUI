import { productionApi } from './api';
import type { ProductionEntry } from './api';
import type { PaginatedResponse as ApiPaginatedResponse } from './api';
import type { ProductionEntrySummary as ApiProductionEntrySummary } from './api';
import type { ProductionStatistics as ApiProductionStatistics } from './api';

export interface ExcelProductionEntry {
  'Tarih': string;
  'Makine No': string;
  'MK Çevrim Hızı': number;
  'Vardiya': number;
  'Kalıp No': number;
  'Buhar': number;
  'Form Sayısı': number;
  'Eşleme Personel': number;
  'Masa Personel': number;
  'Model No': number;
  'Beden No': string;
  'Paket Başına Adet': number;
  'Çuval Başına Paket': number | null;
  'Koli Başına Çuval': number | null;
  'Masa Toplam Paket': number;
  'Ölçü Hatası': number;
  'Örgü Hatası': number;
  'Burun Hatası': number;
  'Diğer Hata': number;
  'Toplam Hata': number;
  'Masada Kalan': number | null;
  'Masa Çıkan': number;
  'Makinadan Alınan Sayı': number;
  'Ölçü Hata Oranı (%)': number;
  'Örgü Hata Oranı (%)': number;
  'Burun Hata Oranı (%)': number;
  'Diğer Hata Oranı (%)': number;
  'Genel Hata Oranı (%)': number;
  'Oluşturulma Tarihi': string;
  'Not': string;
}

class ExcelService {
  private readonly FILE_NAME = 'ProductionEntries.xlsx';

  // Backend'den verileri yükle
  private async loadRecordsFromBackend(
    page: number = 1, 
    pageSize: number = 1000,
    machineNo?: string,
    shift?: number,
    startDate?: string,
    endDate?: string
  ): Promise<ApiPaginatedResponse<ProductionEntry>> {
    try {
      // HATA 2 ÇÖZÜMÜ: shift number ise string'e çevir
      const shiftAsString = shift !== undefined ? String(shift) : undefined;
      return await productionApi.getEntries(page, pageSize, machineNo, shiftAsString, startDate, endDate);
    } catch (error) {
      console.error('Backend\'den veri yüklenirken hata:', error);
      throw new Error('Veriler backend\'den yüklenirken bir hata oluştu');
    }
  }

  // Backend'den özet listesi yükle
  async loadSummaryFromBackend(): Promise<ApiProductionEntrySummary[]> {
    try {
      return await productionApi.getEntriesSummary();
    } catch (error) {
      console.error('Özet veriler backend\'den yüklenirken hata:', error);
      throw new Error('Özet veriler backend\'den yüklenirken bir hata oluştu');
    }
  }

  // Backend'den istatistikleri yükle
  async loadStatisticsFromBackend(): Promise<ApiProductionStatistics> {
    try {
      return await productionApi.getStatistics();
    } catch (error) {
      console.error('İstatistikler backend\'den yüklenirken hata:', error);
      throw new Error('İstatistikler backend\'den yüklenirken bir hata oluştu');
    }
  }

  // Backend'den makine listesi yükle
  async loadMachinesFromBackend(): Promise<string[]> {
    try {
      return await productionApi.getMachines();
    } catch (error) {
      console.error('Makineler backend\'den yüklenirken hata:', error);
      throw new Error('Makineler backend\'den yüklenirken bir hata oluştu');
    }
  }

  // Yeni kayıt ekle - Backend API kullanıyor
  async addRecord(_entry: ProductionEntry): Promise<void> {
    try {
      // Backend zaten Excel dosyasına kaydediyor, sadece API'ye göndermemiz yeterli
      console.log('Kayıt backend\'e gönderiliyor ve Excel dosyasına otomatik kaydediliyor');
      // Bu metot artık sadece bilgilendirme amaçlı, gerçek ekleme işlemi API servisinde yapılıyor
    } catch (error) {
      console.error('Kayıt eklenirken hata:', error);
      throw new Error('Kayıt eklenirken bir hata oluştu');
    }
  }

  // Kayıt güncelle - Backend API kullanıyor
  async updateRecord(_originalEntry: ProductionEntry, _updatedEntry: ProductionEntry): Promise<void> {
    try {
      // Backend zaten Excel dosyasını güncelliyor, sadece API'ye güncelleme isteği göndermemiz yeterli
      console.log('Kayıt backend\'de güncelleniyor ve Excel dosyası otomatik güncelleniyor');
      // Bu metot artık sadece bilgilendirme amaçlı, gerçek güncelleme işlemi API servisinde yapılıyor
    } catch (error) {
      console.error('Kayıt güncellenirken hata:', error);
      throw new Error('Kayıt güncellenirken bir hata oluştu');
    }
  }

  // Backend'den Excel dosyasını indir
  async downloadExcel(): Promise<void> {
    try {
      const blob = await productionApi.downloadExcel();
      
      // Blob'u dosya olarak indir
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = this.FILE_NAME;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      console.log(`Excel dosyası backend'den indirildi: ${this.FILE_NAME}`);
    } catch (error) {
      console.error('Excel dosyası indirilirken hata:', error);
      throw new Error('Excel dosyası indirilirken bir hata oluştu');
    }
  }

  // Tüm kayıtları getir - Backend API kullanıyor
  async getAllRecords(
    page: number = 1, 
    pageSize: number = 1000,
    machineNo?: string,
    shift?: number,
    startDate?: string,
    endDate?: string
  ): Promise<ApiPaginatedResponse<ProductionEntry>> {
    return await this.loadRecordsFromBackend(page, pageSize, machineNo, shift, startDate, endDate);
  }

  // Özet listesi getir - Backend API kullanıyor  
  async getSummaryRecords(): Promise<ApiProductionEntrySummary[]> {
    return await this.loadSummaryFromBackend();
  }

  // İstatistikleri getir - Backend API kullanıyor
  async getStatistics(): Promise<ApiProductionStatistics> {
    return await this.loadStatisticsFromBackend();
  }

  // Makine listesini getir - Backend API kullanıyor
  async getMachines(): Promise<string[]> {
    return await this.loadMachinesFromBackend();
  }

  // Kayıtları temizle - Backend API kullanıyor
  async clearAllRecords(): Promise<void> {
    try {
      // Backend'de tüm kayıtları silme endpoint'i yoksa, bu metot kullanılmamalı
      // Güvenlik nedeniyle bu özellik backend'de implement edilmelidir
      console.warn('Tüm kayıtları silme işlemi backend\'de implement edilmelidir');
      throw new Error('Bu işlem şu anda desteklenmiyor');
    } catch (error) {
      console.error('Kayıtlar temizlenirken hata:', error);
      throw new Error('Kayıtlar temizlenirken bir hata oluştu');
    }
  }

  // Kayıt sayısını getir - Backend API kullanıyor
  async getRecordCount(): Promise<number> {
    try {
      const stats = await this.loadStatisticsFromBackend();
      return stats.totalEntries;
    } catch (error) {
      console.error('Kayıt sayısı alınırken hata:', error);
      return 0;
    }
  }

  // Excel dosyasının backend'deki konumunu getir
  async getExcelFilePath(): Promise<string> {
    try {
      const result = await productionApi.getExcelPath();
      return result.path || 'Data/ProductionEntries.xlsx';
    } catch (error) {
      console.error('Excel dosya konumu alınırken hata:', error);
      return 'Data/ProductionEntries.xlsx'; // Varsayılan konum
    }
  }
}

export const excelService = new ExcelService();
