import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { productionApi } from '../services/api';
import type { ProductionEntry } from '../services/api';
import './ProductionView.css';

const ProductionView = () => {
  const { id } = useParams<{ id: string }>();
  const [entry, setEntry] = useState<ProductionEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadEntry = async () => {
      if (!id) {
        setError('Geçersiz ID');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Backend'de /view endpoint'i yoksa normal endpoint'i kullan
        const data = await productionApi.getEntryById(Number(id));
        setEntry(data);
      } catch (error) {
        console.error('Kayıt yüklenirken hata:', error);
        setError('Kayıt yüklenirken hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    loadEntry();
  }, [id]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('tr-TR');
  };

  if (loading) {
    return (
      <div className="production-view-container">
        <h2>Üretim Verisi Görüntüleme</h2>
        <div className="loading">Yükleniyor...</div>
      </div>
    );
  }

  if (error || !entry) {
    return (
      <div className="production-view-container">
        <h2>Üretim Verisi Görüntüleme</h2>
        <div className="error">{error || 'Kayıt bulunamadı'}</div>
      </div>
    );
  }

  return (
    <div className="production-view-container">
      <h2>Üretim Verisi Görüntüleme</h2>
      
      <div className="view-form">
        <div className="form-section">
          <h3>Temel Bilgiler</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Üretim Tarihi</label>
              <input
                type="text"
                value={formatDate(entry.date)}
                readOnly
                className="readonly-input"
              />
            </div>
            <div className="form-group">
              <label>Makine No</label>
              <input
                type="text"
                value={entry.machineNo}
                readOnly
                className="readonly-input"
              />
            </div>
            <div className="form-group">
              <label>MK Cycle (Hız)</label>
              <input
                type="text"
                value={entry.mkCycleSpeed}
                readOnly
                className="readonly-input"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Vardiya</label>
              <input
                type="text"
                value={entry.shift}
                readOnly
                className="readonly-input"
              />
            </div>
            <div className="form-group">
              <label>Kalıp No</label>
              <input
                type="text"
                value={entry.moldNo}
                readOnly
                className="readonly-input"
              />
            </div>
            <div className="form-group">
              <label>Buhar</label>
              <input
                type="text"
                value={entry.steam}
                readOnly
                className="readonly-input"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Formacı Sayısı</label>
              <input
                type="text"
                value={entry.formCount}
                readOnly
                className="readonly-input"
              />
            </div>
            <div className="form-group">
              <label>Eşlemeci Sayısı</label>
              <input
                type="text"
                value={entry.matchingPersonnelCount}
                readOnly
                className="readonly-input"
              />
            </div>
            <div className="form-group">
              <label>Masacı Sayısı</label>
              <input
                type="text"
                value={entry.tablePersonnelCount}
                readOnly
                className="readonly-input"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Model No</label>
              <input
                type="text"
                value={entry.modelNo}
                readOnly
                className="readonly-input"
              />
            </div>
            <div className="form-group">
              <label>Beden No</label>
              <input
                type="text"
                value={entry.sizeNo}
                readOnly
                className="readonly-input"
              />
            </div>
            <div className="form-group">
              <label>Kaçlı Paket</label>
              <input
                type="text"
                value={entry.itemsPerPackage}
                readOnly
                className="readonly-input"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Poşet İçi Paket</label>
              <input
                type="text"
                value={entry.packagesPerBag || '-'}
                readOnly
                className="readonly-input"
              />
            </div>
            <div className="form-group">
              <label>Koli İçi Paket</label>
              <input
                type="text"
                value={entry.bagsPerBox || '-'}
                readOnly
                className="readonly-input"
              />
            </div>
            <div className="form-group">
              <label>Masa Toplam Paket</label>
              <input
                type="text"
                value={entry.tableTotalPackage}
                readOnly
                className="readonly-input"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Numune Forma Sayısı</label>
              <input
                type="text"
                value={entry.sampleFormCount || 0}
                readOnly
                className="readonly-input"
              />
            </div>
            <div className="form-group">
              <label>Tekrar Forma Sayısı</label>
              <input
                type="text"
                value={entry.repeatFormCount || 0}
                readOnly
                className="readonly-input"
              />
            </div>
            <div className="form-group">
              <label>Dünden Kalan Ürün Sayısı</label>
              <input
                type="text"
                value={entry.yesterdayRemainingCount || 0}
                readOnly
                className="readonly-input"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Eşleşmemiş Ürün Sayısı</label>
              <input
                type="text"
                value={entry.unmatchedProductCount || 0}
                readOnly
                className="readonly-input"
              />
            </div>
            <div className="form-group">
              <label>A Kalite Ürün Sayısı</label>
              <input
                type="text"
                value={entry.aQualityProductCount || 0}
                readOnly
                className="readonly-input"
              />
            </div>
            <div className="form-group">
              <label>İpli Ürün Sayısı</label>
              <input
                type="text"
                value={entry.threadedProductCount || 0}
                readOnly
                className="readonly-input"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Lekeli Ürün Sayısı</label>
              <input
                type="text"
                value={entry.stainedProductCount || 0}
                readOnly
                className="readonly-input"
              />
            </div>
            <div className="form-group">
              {/* Boş alan - denge için */}
            </div>
            <div className="form-group">
              {/* Boş alan - denge için */}
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Kalite Verileri</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Ölçü Hatası</label>
              <input
                type="text"
                value={entry.measurementError}
                readOnly
                className="readonly-input"
              />
            </div>
            <div className="form-group">
              <label>Örgü Hatası</label>
              <input
                type="text"
                value={entry.knittingError}
                readOnly
                className="readonly-input"
              />
            </div>
            <div className="form-group">
              <label>Burun Sakatı</label>
              <input
                type="text"
                value={entry.toeDefect}
                readOnly
                className="readonly-input"
              />
            </div>
            <div className="form-group">
              <label>Diğer Sakat</label>
              <input
                type="text"
                value={entry.otherDefect}
                readOnly
                className="readonly-input"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Masada Kalan Sayı</label>
              <input
                type="text"
                value={entry.remainingOnTableCount || '-'}
                readOnly
                className="readonly-input"
              />
            </div>
            <div className="form-group">
              <label>Masa Çıkan Sayı</label>
              <input
                type="text"
                value={entry.countTakenFromTable}
                readOnly
                className="readonly-input"
              />
            </div>
            <div className="form-group">
              <label>Makinadan Alınan Sayı</label>
              <input
                type="text"
                value={entry.countTakenFromMachine ?? '-'}
                readOnly
                className="readonly-input"
              />
            </div>
            <div className="form-group">
              <label>Toplam Hata</label>
              <input
                type="text"
                value={entry.totalDefects}
                readOnly
                className="readonly-input"
              />
            </div>
            <div className="form-group">
              <label>Genel Hata Oranı</label>
              <input
                type="text"
                value={`${entry.generalErrorRate}%`}
                readOnly
                className="readonly-input"
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Hata Oranları</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Ölçü Hatası Oranı</label>
              <input
                type="text"
                value={`${entry.measurementErrorRate}%`}
                readOnly
                className="readonly-input"
              />
            </div>
            <div className="form-group">
              <label>Örgü Hatası Oranı</label>
              <input
                type="text"
                value={`${entry.knittingErrorRate}%`}
                readOnly
                className="readonly-input"
              />
            </div>
            <div className="form-group">
              <label>Burun Sakatı Oranı</label>
              <input
                type="text"
                value={`${entry.toeDefectRate}%`}
                readOnly
                className="readonly-input"
              />
            </div>
            <div className="form-group">
              <label>Diğer Sakat Oranı</label>
              <input
                type="text"
                value={`${entry.otherDefectRate}%`}
                readOnly
                className="readonly-input"
              />
            </div>
          </div>
        </div>


        {entry.note && (
          <div className="form-section">
            <h3>Kayıt Notu</h3>
            <div className="form-row">
              <div className="form-group" style={{width: '100%'}}>
                <textarea
                  value={entry.note}
                  readOnly
                  className="readonly-input"
                  style={{minHeight: 80, resize: 'vertical', background: '#f6f8fa'}}
                />
              </div>
            </div>
          </div>
        )}

        <div className="form-section">
          <h3>Kayıt Bilgileri</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Oluşturulma Tarihi</label>
              <input
                type="text"
                value={formatDateTime(entry.createdAt)}
                readOnly
                className="readonly-input"
              />
            </div>
            {entry.updatedAt && (
              <div className="form-group">
                <label>Güncelleme Tarihi</label>
                <input
                  type="text"
                  value={formatDateTime(entry.updatedAt)}
                  readOnly
                  className="readonly-input"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="view-actions">
        <button
          type="button"
          onClick={() => window.close()}
          className="close-btn"
        >
          Kapat
        </button>
        <button
          type="button"
          onClick={() => window.print()}
          className="print-btn"
        >
          Yazdır
        </button>
      </div>
    </div>
  );
};

export default ProductionView;
