import { useState, useEffect } from 'react';
import { productionApi } from '../services/api';
import type { ProductionEntry } from '../services/api';
import './HistoryView.css';

const HistoryView = () => {
  const [entries, setEntries] = useState<ProductionEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [filterType, setFilterType] = useState('date');
  const [useTimeFilter, setUseTimeFilter] = useState(false);

  useEffect(() => {
    loadAllEntries();
  }, []);

  const formatDateForAPI = (date: string) => {
    if (!date) return '';
    return new Date(date).toISOString().split('T')[0]; 
  };

  const validateTimeFilter = () => {
    if (startTime && endTime && startTime > endTime) {
      alert('Başlangıç saati bitiş saatinden küçük olmalıdır');
      return false;
    }
    return true;
  };

  const loadAllEntries = async () => {
    try {
      setLoading(true);
      const data = await productionApi.getAllEntries();
      // Her entry için editability bilgisini al
      const entriesWithEditInfo = await Promise.all(
        data.map(async (entry) => {
          try {
            const editInfo = await productionApi.checkEditability(entry.id);
            return {
              ...entry,
              canEdit: editInfo.canEdit,
              timeRemainingForEdit: editInfo.timeRemainingForEdit,
              editStatus: editInfo.editStatus
            };
          } catch (error) {
            console.error(`Entry ${entry.id} editability check failed:`, error);
            return {
              ...entry,
              canEdit: false,
              timeRemainingForEdit: '',
              editStatus: 'Kontrol edilemedi'
            };
          }
        })
      );
      setEntries(entriesWithEditInfo);
    } catch (error) {
      console.error('Kayıtlar yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadEntriesByDateRange = async () => {
    if (!startDate || !endDate) {
      alert('Başlangıç ve bitiş tarihlerini seçiniz');
      return;
    }
    
    if (startDate > endDate) {
      alert('Başlangıç tarihi bitiş tarihinden küçük olmalıdır');
      return;
    }

    if (!validateTimeFilter()) {
      return;
    }

    try {
      setLoading(true);
      const params = new URLSearchParams({
        startDate: formatDateForAPI(startDate),
        endDate: formatDateForAPI(endDate),
        filterBy: filterType
      });
      
      if (startTime) params.append('startTime', startTime);
      if (endTime) params.append('endTime', endTime);
      
      const response = await fetch(`/api/production/entries/date-range?${params}`);
      const data = await response.json();
      
      // Her entry için editability bilgisini al
      const entriesWithEditInfo = await Promise.all(
        data.map(async (entry: ProductionEntry) => {
          try {
            const editInfo = await productionApi.checkEditability(entry.id);
            return {
              ...entry,
              canEdit: editInfo.canEdit,
              timeRemainingForEdit: editInfo.timeRemainingForEdit,
              editStatus: editInfo.editStatus
            };
          } catch (error) {
            console.error(`Entry ${entry.id} editability check failed:`, error);
            return {
              ...entry,
              canEdit: false,
              timeRemainingForEdit: '',
              editStatus: 'Kontrol edilemedi'
            };
          }
        })
      );
      setEntries(entriesWithEditInfo);
    } catch (error) {
      console.error('Filtreleme hatası:', error);
      alert('Filtreleme sırasında hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('tr-TR');
  };

  const handleViewEntry = (id: number) => {
    const viewUrl = `/view/${id}`;
    window.open(viewUrl, '_blank');
  };

  const handleEditEntry = (id: number) => {
    const editUrl = `/edit/${id}`;
    window.open(editUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="history-view-container">
        <h2>Geçmiş Kayıtlar</h2>
        <div className="loading">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="history-view-container">
      <h2>Geçmiş Kayıtlar</h2>

      <div className="filter-section">
        <div className="date-filters">
          <div className="date-input">
            <label htmlFor="filterType">Filtreleme Türü:</label>
            <select
              id="filterType"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="date">Üretim Tarihine Göre</option>
              <option value="created">Kayıt Tarihine Göre</option>
            </select>
          </div>
          <div className="date-input">
            <label htmlFor="startDate">Başlangıç Tarihi:</label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="date-input">
            <label htmlFor="endDate">Bitiş Tarihi:</label>
            <input
              type="date"
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <div className="date-input">
            <label>
              <input 
                type="checkbox" 
                checked={useTimeFilter}
                onChange={(e) => setUseTimeFilter(e.target.checked)}
              />
              Saat bazında filtreleme
            </label>
          </div>
          {useTimeFilter && (
            <div className="time-filters" style={{display: 'contents'}}>
              <div className="date-input">
                <label htmlFor="startTime">Başlangıç Saati:</label>
                <input 
                  type="time" 
                  id="startTime"
                  value={startTime} 
                  onChange={(e) => setStartTime(e.target.value)}
                  placeholder="Başlangıç Saati (opsiyonel)"
                />
              </div>
              <div className="date-input">
                <label htmlFor="endTime">Bitiş Saati:</label>
                <input 
                  type="time" 
                  id="endTime"
                  value={endTime} 
                  onChange={(e) => setEndTime(e.target.value)}
                  placeholder="Bitiş Saati (opsiyonel)"
                />
              </div>
            </div>
          )}
          <button onClick={loadEntriesByDateRange} className="filter-btn">
            Filtrele
          </button>
          <button onClick={loadAllEntries} className="reset-btn">
            Tümünü Göster
          </button>
        </div>
      </div>

      <div className="entries-table-container">
        <table className="entries-table">
          <thead>
            <tr>
              <th>Tarih</th>
              <th>Makine No</th>
              <th>Vardiya</th>
              <th>Model No</th>
              <th>Beden No</th>
              <th>Masa Çıkan</th>
              <th>Toplam Hata</th>
              <th>Hata Oranı</th>
              <th>Kayıt Zamanı</th>
              <th>İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {entries.length === 0 ? (
              <tr>
                <td colSpan={10} className="no-data">
                  Kayıt bulunamadı.
                </td>
              </tr>
            ) : (
              entries.map((entry) => (
                <tr key={entry.id}>
                  <td>{formatDate(entry.date)}</td>
                  <td>{entry.machineNo}</td>
                  <td>{entry.shift}</td>
                  <td>{entry.modelNo}</td>
                  <td>{entry.sizeNo}</td>
                  <td>{entry.countTakenFromTable.toLocaleString()}</td>
                  <td>{entry.totalDefects}</td>
                  <td>{entry.generalErrorRate}%</td>
                  <td>{formatDateTime(entry.createdAt)}</td>
                  <td>
                    <button 
                      className="view-btn"
                      onClick={() => handleViewEntry(entry.id)}
                      title="Detayları görüntüle"
                    >
                      Görüntüle
                    </button>
                    {entry.canEdit && (
                      <button 
                        className="edit-btn"
                        onClick={() => handleEditEntry(entry.id)}
                        title={`Düzenle (${entry.timeRemainingForEdit} kaldı)`}
                        style={{ marginLeft: '5px' }}
                      >
                        Düzenle
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="entries-summary">
        <p>Toplam {entries.length} kayıt bulundu.</p>
      </div>
    </div>
  );
};

export default HistoryView;
