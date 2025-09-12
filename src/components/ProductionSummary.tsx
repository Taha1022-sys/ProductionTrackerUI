import type { ProductionSummary as SummaryType } from '../services/api';
import './ProductionSummary.css';

interface ProductionSummaryProps {
  summary: SummaryType | null;
  loading: boolean;
}

const ProductionSummary = ({ summary, loading }: ProductionSummaryProps) => {
  // Debug için özet verisini konsola bas
  console.log('ProductionSummary - summary:', summary);
  
  if (loading) {
    return (
      <div className="production-summary-container">
        <h2>Üretim Özeti</h2>
        <div className="loading">Yükleniyor...</div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="production-summary-container">
        <h2>Üretim Özeti</h2>
        <div className="no-data">Henüz veri bulunmuyor.</div>
      </div>
    );
  }

  return (
    <div className="production-summary-container">
      <h2>Üretim Özeti</h2>
      
      <div className="summary-grid">
        <div className="summary-section">
          <h3>Toplam Masa Sayıları</h3>
          <div className="summary-row">
            <div className="summary-item">
              <span className="label">Adet:</span>
              <span className="value">{summary.totalTableCount.toLocaleString()}</span>
            </div>
            <div className="summary-item">
              <span className="label">Düzine:</span>
              <span className="value">{summary.totalTableCountDozen.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="summary-section">
          <h3>Toplam Hata Sayıları</h3>
          <div className="summary-row">
            <div className="summary-item">
              <span className="label">Adet:</span>
              <span className="value">{summary.totalErrorCount.toLocaleString()}</span>
            </div>
            <div className="summary-item">
              <span className="label">Düzine:</span>
              <span className="value">{summary.totalErrorCountDozen.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="summary-section error-breakdown">
          <h3>Hata Türlerine Göre Dağılım</h3>
          
          <div className="error-item">
            <div className="error-header">
              <span className="error-name">Masa Çıkan</span>
            </div>
            <div className="error-details">
              <div className="error-row">
                <span className="label">Adet:</span>
                <span className="value">{summary.countTakenFromTable ?? '-'}</span>
              </div>
              <div className="error-row">
                <span className="label">Düzine:</span>
                <span className="value">{summary.countTakenFromTableDozen ?? '-'}</span>
              </div>
            </div>
          </div>
          
          <div className="error-item">
            <div className="error-header">
              <span className="error-name">Makinadan Alınan Sayı</span>
            </div>
            <div className="error-details">
              <div className="error-row">
                <span className="label">Adet:</span>
                <span className="value">{summary.countTakenFromMachine ?? '-'}</span>
              </div>
              <div className="error-row">
                <span className="label">Düzine:</span>
                <span className="value">{summary.countTakenFromMachineDozen ?? '-'}</span>
              </div>
            </div>
          </div>

          <div className="error-item">
            <div className="error-header">
              <span className="error-name">Ölçü Hatası</span>
            </div>
            <div className="error-details">
              <div className="error-row">
                <span className="label">Adet:</span>
                <span className="value">{summary.measurementErrorCount}</span>
              </div>
              <div className="error-row">
                <span className="label">Düzine:</span>
                <span className="value">{summary.measurementErrorDozen}</span>
              </div>
              <div className="error-row">
                <span className="label">Oran:</span>
                <span className="value">{summary.measurementErrorRate}%</span>
              </div>
            </div>
          </div>

          <div className="error-item">
            <div className="error-header">
              <span className="error-name">Örgü Hatası</span>
            </div>
            <div className="error-details">
              <div className="error-row">
                <span className="label">Adet:</span>
                <span className="value">{summary.knittingErrorCount}</span>
              </div>
              <div className="error-row">
                <span className="label">Düzine:</span>
                <span className="value">{summary.knittingErrorDozen}</span>
              </div>
              <div className="error-row">
                <span className="label">Oran:</span>
                <span className="value">{summary.knittingErrorRate}%</span>
              </div>
            </div>
          </div>

          <div className="error-item">
            <div className="error-header">
              <span className="error-name">Burun Sakatı</span>
            </div>
            <div className="error-details">
              <div className="error-row">
                <span className="label">Adet:</span>
                <span className="value">{summary.toeDefectCount}</span>
              </div>
              <div className="error-row">
                <span className="label">Düzine:</span>
                <span className="value">{summary.toeDefectDozen}</span>
              </div>
              <div className="error-row">
                <span className="label">Oran:</span>
                <span className="value">{summary.toeDefectRate}%</span>
              </div>
            </div>
          </div>

          <div className="error-item">
            <div className="error-header">
              <span className="error-name">Diğer Sakat</span>
            </div>
            <div className="error-details">
              <div className="error-row">
                <span className="label">Adet:</span>
                <span className="value">{summary.otherDefectCount}</span>
              </div>
              <div className="error-row">
                <span className="label">Düzine:</span>
                <span className="value">{summary.otherDefectDozen}</span>
              </div>
              <div className="error-row">
                <span className="label">Oran:</span>
                <span className="value">{summary.otherDefectRate}%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="summary-section">
          <h3>Masa ve Makine Karşılaştırması</h3>
          <div className="summary-row">
            <div className="summary-item">
              <span className="label">Masa Çıkan Sayı (Adet):</span>
              <span className="value">{summary.countTakenFromTable?.toLocaleString() || '-'}</span>
            </div>
            <div className="summary-item">
              <span className="label">Masa Çıkan Sayı (Düzine):</span>
              <span className="value">{summary.countTakenFromTableDozen?.toLocaleString() || '-'}</span>
            </div>
          </div>
          <div className="summary-row">
            <div className="summary-item">
              <span className="label">Makinadan Alınan Sayı (Adet):</span>
              <span className="value">{summary.countTakenFromMachine?.toLocaleString() || '-'}</span>
            </div>
            <div className="summary-item">
              <span className="label">Makinadan Alınan Sayı (Düzine):</span>
              <span className="value">{summary.countTakenFromMachineDozen?.toLocaleString() || '-'}</span>
            </div>
          </div>
          {summary.countTakenFromTable && summary.countTakenFromMachine && (
            <div className="summary-row">
              <div className="summary-item">
                <span className="label">Fark (Adet):</span>
                <span className={`value ${(summary.countTakenFromMachine - summary.countTakenFromTable) >= 0 ? 'positive' : 'negative'}`}>
                  {(summary.countTakenFromMachine - summary.countTakenFromTable).toLocaleString()}
                </span>
              </div>
              <div className="summary-item">
                <span className="label">Fark Oranı:</span>
                <span className={`value ${(summary.countTakenFromMachine - summary.countTakenFromTable) >= 0 ? 'positive' : 'negative'}`}>
                  {summary.countTakenFromTable > 0 
                    ? `${(((summary.countTakenFromMachine - summary.countTakenFromTable) / summary.countTakenFromTable) * 100).toFixed(2)}%`
                    : '-'
                  }
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="summary-section overall-error">
          <h3>Genel Hata Oranı</h3>
          <div className="overall-error-rate">
            <span className="rate-value">{summary.overallErrorRate}%</span>
          </div>
        </div>
      </div>

      <div className="summary-footer">
        <small>Son güncelleme: {new Date(summary.calculatedAt).toLocaleString('tr-TR')}</small>
      </div>
    </div>
  );
};

export default ProductionSummary;
