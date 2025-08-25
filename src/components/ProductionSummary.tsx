import type { ProductionSummary as SummaryType } from '../services/api';
import './ProductionSummary.css';

interface ProductionSummaryProps {
  summary: SummaryType | null;
  loading: boolean;
}

const ProductionSummary = ({ summary, loading }: ProductionSummaryProps) => {
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
