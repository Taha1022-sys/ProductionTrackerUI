import React, { useState, useEffect } from 'react';
import { excelService } from '../services/excelService';
import { productionApi } from '../services/api';
import type { ProductionEntry, ProductionEntrySummary, ProductionStatistics } from '../services/api';

// Örnek: Üretim Listesi Component'i
export const ProductionListComponent: React.FC = () => {
  const [entries, setEntries] = useState<ProductionEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [filters, setFilters] = useState({
    machineNo: '',
    shift: 0,
    startDate: '',
    endDate: ''
  });

  // Verileri yükle
  const loadEntries = async () => {
    setLoading(true);
    try {
      const response = await excelService.getAllRecords(
        page,
        pageSize,
        filters.machineNo || undefined,
        filters.shift || undefined,
        filters.startDate || undefined,
        filters.endDate || undefined
      );
      
      setEntries(response.items);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Veriler yüklenirken hata:', error);
      alert('Veriler yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // Component mount edildiğinde verileri yükle
  useEffect(() => {
    loadEntries();
  }, [page, filters]);

  // Excel dosyasını indir
  const handleDownloadExcel = async () => {
    try {
      await excelService.downloadExcel();
      alert('Excel dosyası başarıyla indirildi!');
    } catch (error) {
      console.error('Excel indirme hatası:', error);
      alert('Excel dosyası indirilirken bir hata oluştu');
    }
  };

  return (
    <div className="production-list">
      <div className="header">
        <h2>Üretim Kayıtları</h2>
        <button onClick={handleDownloadExcel}>
          📥 Excel İndir
        </button>
      </div>

      {/* Filtreler */}
      <div className="filters">
        <input
          type="text"
          placeholder="Makine No"
          value={filters.machineNo}
          onChange={(e) => setFilters({...filters, machineNo: e.target.value})}
        />
        <select
          value={filters.shift}
          onChange={(e) => setFilters({...filters, shift: Number(e.target.value)})}
        >
          <option value={0}>Tüm Vardiyalar</option>
          <option value={1}>Vardiya 1</option>
          <option value={2}>Vardiya 2</option>
          <option value={3}>Vardiya 3</option>
        </select>
        <input
          type="date"
          value={filters.startDate}
          onChange={(e) => setFilters({...filters, startDate: e.target.value})}
        />
        <input
          type="date"
          value={filters.endDate}
          onChange={(e) => setFilters({...filters, endDate: e.target.value})}
        />
      </div>

      {/* Loading */}
      {loading && <div className="loading">Yükleniyor...</div>}

      {/* Tablo */}
      <table className="production-table">
        <thead>
          <tr>
            <th>Tarih</th>
            <th>Makine No</th>
            <th>Vardiya</th>
            <th>Model No</th>
            <th>Toplam Paket</th>
            <th>Genel Hata Oranı</th>
            <th>İşlemler</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr key={entry.id}>
              <td>{new Date(entry.date).toLocaleDateString('tr-TR')}</td>
              <td>{entry.machineNo}</td>
              <td>{entry.shift}</td>
              <td>{entry.modelNo}</td>
              <td>{entry.tableTotalPackage}</td>
              <td>{entry.generalErrorRate.toFixed(2)}%</td>
              <td>
                <button onClick={() => viewDetails(entry.id)}>
                  Detay
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Sayfalama */}
      <div className="pagination">
        <button 
          disabled={page <= 1} 
          onClick={() => setPage(page - 1)}
        >
          Önceki
        </button>
        <span>Sayfa {page} / {totalPages}</span>
        <button 
          disabled={page >= totalPages} 
          onClick={() => setPage(page + 1)}
        >
          Sonraki
        </button>
      </div>
    </div>
  );

  async function viewDetails(id: number) {
    try {
      const entry = await productionApi.getEntryById(id);
      console.log('Detay:', entry);
      // Modal açma veya detay sayfasına yönlendirme kodları
    } catch (error) {
      console.error('Detay yüklenirken hata:', error);
    }
  }
};

// Örnek: Özet Dashboard Component'i
export const DashboardComponent: React.FC = () => {
  const [summary, setSummary] = useState<ProductionEntrySummary[]>([]);
  const [statistics, setStatistics] = useState<ProductionStatistics | null>(null);
  const [machines, setMachines] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Paralel olarak tüm verileri yükle
      const [summaryData, statsData, machinesData] = await Promise.all([
        excelService.getSummaryRecords(),
        excelService.getStatistics(),
        excelService.getMachines()
      ]);

      setSummary(summaryData);
      setStatistics(statsData);
      setMachines(machinesData);
      
    } catch (error) {
      console.error('Dashboard verileri yüklenirken hata:', error);
      alert('Dashboard verileri yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Dashboard yükleniyor...</div>;
  }

  return (
    <div className="dashboard">
      <h2>Üretim Dashboard</h2>
      
      {/* İstatistikler */}
      {statistics && (
        <div className="statistics">
          <div className="stat-card">
            <h3>Toplam Kayıt</h3>
            <p>{statistics.totalEntries}</p>
          </div>
          <div className="stat-card">
            <h3>Ortalama Hata Oranı</h3>
            <p>{statistics.averageErrorRate.toFixed(2)}%</p>
          </div>
          <div className="stat-card">
            <h3>Aktif Makine Sayısı</h3>
            <p>{machines.length}</p>
          </div>
        </div>
      )}

      {/* Son 10 Kayıt */}
      <div className="recent-entries">
        <h3>Son Kayıtlar</h3>
        <table>
          <thead>
            <tr>
              <th>Tarih</th>
              <th>Makine</th>
              <th>Vardiya</th>
              <th>Model</th>
              <th>Hata Oranı</th>
            </tr>
          </thead>
          <tbody>
            {summary.slice(0, 10).map((item) => (
              <tr key={item.id}>
                <td>{new Date(item.date).toLocaleDateString('tr-TR')}</td>
                <td>{item.machineNo}</td>
                <td>{item.shift}</td>
                <td>{item.modelNo}</td>
                <td>{item.generalErrorRate.toFixed(2)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* En Çok Kullanılan Makineler */}
      {statistics && (
        <div className="top-machines">
          <h3>En Çok Kullanılan Makineler</h3>
          <ul>
            {statistics.topMachines.map((machine, index) => (
              <li key={machine.machineNo}>
                {index + 1}. {machine.machineNo} - {machine.count} kayıt
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

// Örnek: Makine Seçimi Component'i  
export const MachineSelectComponent: React.FC<{
  value: string;
  onChange: (value: string) => void;
}> = ({ value, onChange }) => {
  const [machines, setMachines] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMachines();
  }, []);

  const loadMachines = async () => {
    try {
      const machineList = await excelService.getMachines();
      setMachines(machineList);
    } catch (error) {
      console.error('Makineler yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <select disabled><option>Yükleniyor...</option></select>;
  }

  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">Makine Seçin</option>
      {machines.map((machine) => (
        <option key={machine} value={machine}>
          {machine}
        </option>
      ))}
    </select>
  );
};

/* 
🔧 Component'lerinizi güncelleme rehberi:

1. ✅ State Yönetimi:
   - useState hook'larını async veriler için kullanın
   - Loading state'leri ekleyin
   - Error handling ekleyin

2. ✅ API Çağrıları:
   - useEffect ile component mount'ta verileri yükleyin
   - excelService metotlarını await ile çağırın
   - Error'ları try-catch ile yakalayın

3. ✅ Sayfalama:
   - getAllRecords metodu sayfalama parametreleri alıyor
   - totalPages bilgisini kullanarak navigation yapın

4. ✅ Filtreleme:
   - machineNo, shift, startDate, endDate parametrelerini kullanın
   - Filter değiştiğinde yeniden veri yükleyin

5. ✅ Excel İndirme:
   - downloadExcel metodu artık backend'den dosya indiriyor
   - Blob olarak dosya alıp otomatik indiriliyor

6. 📋 Mevcut Component'lerinizi Güncelleyin:
   - ProductionForm.tsx
   - ProductionView.tsx  
   - ProductionSummary.tsx
   - Navigation.tsx

Bu örnekleri referans alarak mevcut component'lerinizi güncelleyebilirsiniz.
*/
