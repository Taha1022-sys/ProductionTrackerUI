import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { productionApi } from '../services/api';
import type { ProductionEntry } from '../services/api';
import './ProductionList.css';

const ProductionList: React.FC = () => {
  const [entries, setEntries] = useState<ProductionEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [filters, setFilters] = useState({
    id: '',
    machineNo: '',
    shift: '',
    startDate: '',
    endDate: ''
  });
  const [machines, setMachines] = useState<string[]>([]);

  // Makine listesini yükle
  const loadMachines = async () => {
    try {
      const machineList = await productionApi.getMachines();
      setMachines(machineList);
    } catch (error) {
      console.error('Makineler yüklenirken hata:', error);
    }
  };

  // Veri yükleme fonksiyonu
  const loadData = useCallback(async () => {
    console.log('ProductionList: Veri yükleniyor...');
    console.log('ProductionList: Filters:', filters);
    setLoading(true);
    try {
      let response;
      
      // ID filtresi varsa tüm kayıtları çek
      if (filters.id && filters.id.trim() !== '') {
        // Önce toplam sayıyı öğrenmek için normal çağrı yap
        const initialResponse = await productionApi.getEntries(
          1,
          10,
          filters.machineNo || undefined,
          filters.shift && filters.shift !== '' ? filters.shift : undefined,
          filters.startDate || undefined,
          filters.endDate || undefined
        );
        
        // Toplam kayıt sayısı kadar büyük pageSize ile tüm kayıtları çek
        response = await productionApi.getEntries(
          1,
          initialResponse.totalCount || 1000, // Güvenli bir üst limit
          filters.machineNo || undefined,
          filters.shift && filters.shift !== '' ? filters.shift : undefined,
          filters.startDate || undefined,
          filters.endDate || undefined
        );
      } else {
        // Normal sayfalama
        response = await productionApi.getEntries(
          page,
          pageSize,
          filters.machineNo || undefined,
          filters.shift && filters.shift !== '' ? filters.shift : undefined,
          filters.startDate || undefined,
          filters.endDate || undefined
        );
      }
      
      console.log('ProductionList: API response:', response);
      
      // Backend'de ID filtresi yoksa frontend'de filtrele
      let filteredItems = response.items;
      let filteredTotalCount = response.totalCount;
      let filteredTotalPages = response.totalPages;
      
      if (filters.id && filters.id.trim() !== '') {
        const idToFind = parseInt(filters.id.trim());
        filteredItems = response.items.filter(item => item.id === idToFind);
        filteredTotalCount = filteredItems.length;
        filteredTotalPages = Math.ceil(filteredTotalCount / pageSize);
      }
      
      setEntries(filteredItems);
      setTotalPages(filteredTotalPages);
      setTotalCount(filteredTotalCount);
      console.log('ProductionList: Veriler yüklendi, toplam:', filteredTotalCount);
    } catch (error) {
      console.error('ProductionList: Veriler yüklenirken hata:', error);
      alert('Veriler yüklenirken bir hata oluştu: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, filters]);

  // Component mount edildiğinde ve filtreler değiştiğinde verileri yükle
  useEffect(() => {
    loadMachines();
    loadData();
  }, [loadData]);

  // Yeni kayıt oluşturulduğunda listeyi yenilemek için mesaj dinleyicisi
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'ENTRY_CREATED') {
        console.log('Yeni kayıt oluşturuldu, liste yenileniyor...');
        loadData();
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [loadData]);

  // Filtreleri temizle
  const clearFilters = () => {
    setFilters({
      id: '',
      machineNo: '',
      shift: '',
      startDate: '',
      endDate: ''
    });
    setPage(1);
  };

  // ID filtresi değiştiğinde sayfayı sıfırla
  useEffect(() => {
    if (filters.id && filters.id.trim() !== '') {
      setPage(1);
    }
  }, [filters.id]);

  return (
    <div className="production-list">
      <div className="page-header">
        <h2>Üretim Kayıtları</h2>
        <div className="header-actions">
          <Link to="/" className="btn btn-secondary">
            ➕ Yeni Kayıt
          </Link>
        </div>
      </div>

      {/* Filtreler */}
      <div className="filters-section">
        <h3>Filtreler</h3>
        <div className="filters-grid">
          <div className="filter-group">
            <label>ID:</label>
            <input
              type="number"
              value={filters.id}
              onChange={(e) => setFilters({...filters, id: e.target.value})}
              placeholder="ID ile ara..."
            />
          </div>

          <div className="filter-group">
            <label>Makine No:</label>
            <select
              value={filters.machineNo}
              onChange={(e) => setFilters({...filters, machineNo: e.target.value})}
            >
              <option value="">Tüm Makineler</option>
              {machines && machines.map((machine) => (
                <option key={machine} value={machine}>
                  {machine}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Vardiya:</label>
            <select
              value={filters.shift}
              onChange={(e) => setFilters({...filters, shift: e.target.value})}
            >
              <option value="">Tüm Vardiyalar</option>
              <option value="1">Vardiya 1</option>
              <option value="2">Vardiya 2</option>
              <option value="3">Vardiya 3</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Başlangıç Üretim Tarihi:</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({...filters, startDate: e.target.value})}
            />
          </div>

          <div className="filter-group">
            <label>Bitiş Üretim Tarihi:</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({...filters, endDate: e.target.value})}
            />
          </div>

          <div className="filter-actions">
            <button onClick={clearFilters} className="btn btn-secondary">
              🗑️ Temizle
            </button>
          </div>
        </div>
      </div>

      {/* Sonuç sayısı */}
      <div className="results-info">
        <p>Toplam {totalCount} kayıt bulundu (Sayfa {page} / {totalPages})</p>
      </div>

      {/* Loading */}
      {loading && <div className="loading">Yükleniyor...</div>}

      {/* Tablo */}
      {!loading && (
        <div className="table-container">
          <table className="production-table">
            <thead>
              <tr>
                <th>Üretim Tarihi</th>
                <th>ID</th>
                <th>Makine No</th>
                <th>Vardiya</th>
                <th>Model No</th>
                <th>Beden</th>
                <th>Toplam Paket</th>
                <th>Genel Hata Oranı</th>
                <th>Oluşturulma Tarihi</th>
                <th>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {!loading && entries && entries.length === 0 ? (
                <tr>
                  <td colSpan={13} className="no-data">
                    Kayıt bulunamadı
                  </td>
                </tr>
              ) : !loading && entries ? (
                entries.map((entry, index) => (
                  <tr key={entry.id || index}>
                    <td>{new Date(entry.date).toLocaleDateString('tr-TR')}</td>
                    <td>{entry.id}</td>
                    <td>{entry.machineNo}</td>
                    <td>{entry.shift}</td>
                    <td>{entry.modelNo}</td>
                    <td>{entry.sizeNo}</td>
                    <td>{entry.tableTotalPackage}</td>
                    <td className={entry.generalErrorRate > 5 ? 'high-error' : 'low-error'}>
                      {entry.generalErrorRate.toFixed(2)}%
                    </td>
                    <td>{new Date(entry.createdAt).toLocaleDateString('tr-TR')} {new Date(entry.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</td>
                    <td className="actions">
                      <Link 
                        to={`/view/${entry.id}`} 
                        className="btn btn-sm btn-view"
                        title="Detay Görüntüle"
                      >
                        Görüntüle
                      </Link>
                      {entry.canEdit && (
                        <Link 
                          to={`/edit/${entry.id}`} 
                          className="btn btn-sm btn-warning"
                          title="Düzenle"
                        >
                          ✏️
                        </Link>
                      )}
                    </td>
                  </tr>
                ))
              ) : null}
            </tbody>
          </table>
        </div>
      )}

      {/* Sayfalama */}
      {totalPages > 1 && (
        <div className="pagination">
          <button 
            disabled={page <= 1} 
            onClick={() => setPage(page - 1)}
            className="btn btn-secondary"
          >
            ‹ Önceki
          </button>
          
          <div className="page-numbers">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = Math.max(1, page - 2) + i;
              if (pageNum > totalPages) return null;
              
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`btn ${page === pageNum ? 'btn-primary' : 'btn-secondary'}`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>
          
          <button 
            disabled={page >= totalPages} 
            onClick={() => setPage(page + 1)}
            className="btn btn-secondary"
          >
            Sonraki ›
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductionList;
