// Excel Service Backend Entegrasyonu Kullanım Örnekleri

import { excelService } from '../services/excelService';
import { productionApi } from '../services/api';
import { ProductionEntryDto } from '../services/api';

// Örnek 1: Yeni Kayıt Ekleme (Backend Excel'e otomatik kaydeder)
export async function addNewProductionEntry() {
  try {
    const newEntry: ProductionEntryDto = {
      date: new Date().toISOString(),
      machineNo: 'M001',
      mkCycleSpeed: 100,
      shift: 1,
      moldNo: 123,
      steam: 85,
      formCount: 10,
      matchingPersonnelCount: 2,
      tablePersonnelCount: 3,
      modelNo: 456,
      sizeNo: '42-44',
      itemsPerPackage: 12,
      packagesPerBag: 10,
      bagsPerBox: 5,
      tableTotalPackage: 100,
      sampleFormCount: 2,
      repeatFormCount: 1,
      yesterdayRemainingCount: 5,
      unmatchedProductCount: 3,
      aQualityProductCount: 90,
      threadedProductCount: 2,
      stainedProductCount: 1,
      measurementError: 2,
      knittingError: 1,
      toeDefect: 0,
      otherDefect: 1,
      remainingOnTableCount: 5,
      countTakenFromTable: 95,
      countTakenFromMachine: 100 // HATA 1 ÇÖZÜMÜ: Eksik özellik eklendi
    };

    // Backend'e kaydet (otomatik olarak Excel dosyasına da kaydeder)
    const savedEntry = await productionApi.createEntry(newEntry);
    console.log('✅ Kayıt backend\'e ve Excel dosyasına kaydedildi:', savedEntry);

    // Excel servisi artık sadece bilgilendirme amaçlı
    await excelService.addRecord(savedEntry);
    
  } catch (error) {
    console.error('❌ Kayıt eklenirken hata:', error);
  }
}

// Örnek 2: Sayfalı Veri Listeleme
export async function listProductionEntries() {
  try {
    // İlk sayfa, 10 kayıt
    const page1 = await excelService.getAllRecords(1, 10);
    console.log('📄 Sayfa 1 verileri:', page1);

    // Filtreli arama - Makine M001, Vardiya 1
    const filteredData = await excelService.getAllRecords(1, 10, 'M001', 1);
    console.log('🔍 Filtreli veriler:', filteredData);

    // Tarih aralığında arama
    const startDate = '2024-01-01';
    const endDate = '2024-12-31';
    const dateRangeData = await excelService.getAllRecords(1, 50, undefined, undefined, startDate, endDate);
    console.log('📅 Tarih aralığındaki veriler:', dateRangeData);

  } catch (error) {
    console.error('❌ Veriler listelenirken hata:', error);
  }
}

// Örnek 3: Özet Listesi Görüntüleme
export async function getSummaryData() {
  try {
    const summary = await excelService.getSummaryRecords();
    console.log('📊 Özet veriler:', summary);

    // Her özet kaydı için detay bilgilerini de alabilirsiniz
    for (const item of summary.slice(0, 5)) { // İlk 5 kayıt için
      const detail = await productionApi.getEntryById(item.id);
      console.log(`📋 ${item.machineNo} detayı:`, detail);
    }

  } catch (error) {
    console.error('❌ Özet veriler alınırken hata:', error);
  }
}

// Örnek 4: İstatistikleri Görüntüleme
export async function getStatistics() {
  try {
    const stats = await excelService.getStatistics();
    console.log('📈 İstatistikler:');
    console.log(`- Toplam kayıt sayısı: ${stats.totalEntries}`);
    console.log(`- Ortalama hata oranı: ${stats.averageErrorRate}%`);
    console.log('- En çok kullanılan makineler:', stats.topMachines);
    console.log('- Aylık üretim:', stats.monthlyProduction);

  } catch (error) {
    console.error('❌ İstatistikler alınırken hata:', error);
  }
}

// Örnek 5: Makine Listesi Alma
export async function getMachineList() {
  try {
    const machines = await excelService.getMachines();
    console.log('🏭 Mevcut makineler:', machines);

    // Dropdown için kullanılabilir
    const machineOptions = machines.map(machine => ({
      value: machine,
      label: `Makine ${machine}`
    }));
    console.log('📋 Dropdown seçenekleri:', machineOptions);

  } catch (error) {
    console.error('❌ Makine listesi alınırken hata:', error);
  }
}

// Örnek 6: Excel Dosyasını İndirme
export async function downloadExcelFile() {
  try {
    await excelService.downloadExcel();
    console.log('✅ Excel dosyası başarıyla indirildi!');

  } catch (error) {
    console.error('❌ Excel dosyası indirilirken hata:', error);
  }
}

// Örnek 7: Excel Dosyasının Konumunu Öğrenme
export async function getExcelLocation() {
  try {
    const path = await excelService.getExcelFilePath();
    console.log(`📁 Excel dosyası konumu: ${path}`);

  } catch (error) {
    console.error('❌ Excel dosya konumu alınırken hata:', error);
  }
}

// Örnek 8: Kayıt Sayısını Alma
export async function getRecordCount() {
  try {
    const count = await excelService.getRecordCount();
    console.log(`📊 Toplam kayıt sayısı: ${count}`);

  } catch (error) {
    console.error('❌ Kayıt sayısı alınırken hata:', error);
  }
}

// Tüm örnekleri çalıştırmak için
export async function runAllExamples() {
  console.log('🚀 Excel Service Backend Entegrasyonu Örnekleri\n');
  
  await getMachineList();
  await getRecordCount();
  await getStatistics();
  await getSummaryData();
  await listProductionEntries();
  await getExcelLocation();
  
}
