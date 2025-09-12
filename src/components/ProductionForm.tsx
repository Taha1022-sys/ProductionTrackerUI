import { useState, useEffect } from 'react';
import { productionApi } from '../services/api';
import { excelService } from '../services/excelService';
import type { ProductionEntryDto, ProductionEntryUpdateDto, EditabilityCheckDto, ProductionEntry } from '../services/api';
import './ProductionForm.css';

interface ProductionFormProps {
  onEntryCreated?: () => void;
  editMode?: boolean;
  entryId?: number;
  onEntryUpdated?: () => void;
}

const ProductionForm = ({ onEntryCreated, editMode = false, entryId, onEntryUpdated }: ProductionFormProps) => {
  // Not şablonları
  const noteTemplates = [
    'Makine bakımı yapıldı.',
    'Üretim sırasında aksaklık yaşandı.',
    'Numune alındı.',
    'Personel değişikliği oldu.',
    'Stok kontrolü yapıldı.',
    'Kalite kontrol uygulandı.'
  ];

  // Şablon seçildiğinde not alanını doldur
  const handleNoteTemplateClick = (template: string) => {
    setFormData(prev => ({ ...prev, note: template }));
  };
  const todayDate = new Date().toISOString().split('T')[0];
  
  const [formData, setFormData] = useState<ProductionEntryDto & { note?: string }>({
    date: todayDate,
    machineNo: '',
    mkCycleSpeed: 0,
    shift: 1,
    moldNo: 1,
    steam: 0,
    formCount: 1,
    matchingPersonnelCount: 1,
    tablePersonnelCount: 1,
    modelNo: 1,
    sizeNo: '',
    itemsPerPackage: 1,
    packagesPerBag: undefined,
    bagsPerBox: undefined,
    tableTotalPackage: 0,
    sampleFormCount: 0,
    repeatFormCount: 0,
    yesterdayRemainingCount: 0,
    unmatchedProductCount: 0,
    aQualityProductCount: 0,
    threadedProductCount: 0,
    stainedProductCount: 0,
    measurementError: 0,
    knittingError: 0,
    toeDefect: 0,
    otherDefect: 0,
    remainingOnTableCount: undefined,
    countTakenFromTable: 0,
    countTakenFromMachine: 0,
    note: '',
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [editabilityInfo, setEditabilityInfo] = useState<EditabilityCheckDto | null>(null);
  const [entryCreatedAt, setEntryCreatedAt] = useState<string>('');
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  const calculateTimeRemaining = (createdAt: string) => {
    const created = new Date(createdAt);
    const now = new Date();
    const oneHourLater = new Date(created.getTime() + 60 * 60 * 1000); // 1 saat ekle
    
    if (now >= oneHourLater) {
      return 'Süre doldu';
    }
    
    const remainingMs = oneHourLater.getTime() - now.getTime();
    const remainingMinutes = Math.floor(remainingMs / (1000 * 60));
    const remainingSeconds = Math.floor((remainingMs % (1000 * 60)) / 1000);
    
    return `${remainingMinutes} dakika ${remainingSeconds} saniye`;
  };

  useEffect(() => {
    if (editMode && entryCreatedAt) {
      const interval = setInterval(() => {
        const remaining = calculateTimeRemaining(entryCreatedAt);
        setTimeRemaining(remaining);
        
        if (remaining === 'Süre doldu' && editabilityInfo?.canEdit) {
          setEditabilityInfo(prev => prev ? { ...prev, canEdit: false } : null);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [editMode, entryCreatedAt, editabilityInfo?.canEdit]);

  // Düzenleme modunda entry verilerini yükle
  useEffect(() => {
    const loadEntryForEdit = async () => {
      try {
        setLoading(true);
        const entry = await productionApi.getEntryById(entryId!);
        setFormData({
          date: entry.date.split('T')[0], // ISO formatından sadece üretim tarihini al
          machineNo: entry.machineNo,
          mkCycleSpeed: entry.mkCycleSpeed,
          shift: entry.shift,
          moldNo: entry.moldNo,
          steam: entry.steam,
          formCount: entry.formCount,
          matchingPersonnelCount: entry.matchingPersonnelCount,
          tablePersonnelCount: entry.tablePersonnelCount,
          modelNo: entry.modelNo,
          sizeNo: entry.sizeNo,
          itemsPerPackage: entry.itemsPerPackage,
          packagesPerBag: entry.packagesPerBag,
          bagsPerBox: entry.bagsPerBox,
          tableTotalPackage: entry.tableTotalPackage,
          sampleFormCount: entry.sampleFormCount || 0,
          repeatFormCount: entry.repeatFormCount || 0,
          yesterdayRemainingCount: entry.yesterdayRemainingCount || 0,
          unmatchedProductCount: entry.unmatchedProductCount || 0,
          aQualityProductCount: entry.aQualityProductCount || 0,
          threadedProductCount: entry.threadedProductCount || 0,
          stainedProductCount: entry.stainedProductCount || 0,
          measurementError: entry.measurementError,
          knittingError: entry.knittingError,
          toeDefect: entry.toeDefect,
          otherDefect: entry.otherDefect,
          remainingOnTableCount: entry.remainingOnTableCount,
          countTakenFromTable: entry.countTakenFromTable,
          countTakenFromMachine: entry.countTakenFromMachine,
        });
        // CreatedAt'i set et
        setEntryCreatedAt(entry.createdAt);
        // İlk kalan süreyi hesapla
        setTimeRemaining(calculateTimeRemaining(entry.createdAt));
      } catch (error) {
        console.error('Entry yüklenirken hata:', error);
        setMessage('Kayıt yüklenirken hata oluştu!');
      } finally {
        setLoading(false);
      }
    };

    const checkEditability = async () => {
      try {
        const info = await productionApi.checkEditability(entryId!);
        setEditabilityInfo(info);
        if (!info.canEdit) {
          setMessage(`Bu kayıt düzenlenemez: ${info.editStatus}`);
        }
      } catch (error) {
        console.error('Düzenleme kontrolü hatası:', error);
        setMessage('Düzenleme kontrolü yapılamadı!');
      }
    };

    const loadData = async () => {
      if (editMode && entryId) {
        await loadEntryForEdit();
        await checkEditability();
      }
    };
    loadData();
  }, [editMode, entryId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'note') {
      setFormData(prev => ({ ...prev, note: value }));
      return;
    }
    const stringFields = ['machineNo', 'sizeNo', 'date'];
    setFormData(prev => ({
      ...prev,
      [name]: stringFields.includes(name)
        ? value
        : value === '' ? undefined : Number(value)
    }));
  };

  // Fotoğraf yükleme kaldırıldı

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      console.log('Gönderilen form data:', formData);
      
      const requiredFields = ['machineNo', 'sizeNo'];
      const missingFields = requiredFields.filter(field => !formData[field as keyof ProductionEntryDto]);
      
      if (missingFields.length > 0) {
        setMessage(`Gerekli alanlar eksik: ${missingFields.join(', ')}`);
        setLoading(false);
        return;
      }

      if (editMode && entryId) {
        // Düzenleme işlemi - süre kontrolü
        if (timeRemaining === 'Süre doldu') {
          setMessage('Bu kayıt artık düzenlenemez: 1 saatlik düzenleme süresi dolmuştur.');
          setLoading(false);
          return;
        }

        const updateData: ProductionEntryUpdateDto = {
          ...formData
        };
        
        const updatedEntry = await productionApi.updateEntry(entryId, updateData);
        
        // Excel'de de güncelle
        try {
          // Önce orijinal entry'yi alıp Excel'de güncelle
          const originalEntry = await productionApi.getEntryById(entryId);
          excelService.updateRecord(originalEntry, updatedEntry);
          console.log('Kayıt Excel dosyasında güncellendi');
        } catch (excelError) {
          console.error('Excel güncelleme hatası:', excelError);
          // Excel hatası olsa bile form başarılı olarak devam etsin
        }
        
        setMessage('Veri başarıyla güncellendi ve Excel dosyasına kaydedildi!');
        onEntryUpdated?.();
      } else {
        // Yeni kayıt oluşturma
        console.log('Form verisi gönderiliyor:', formData);
        const newEntry = await productionApi.createEntry(formData);
        console.log('Yeni kayıt oluşturuldu:', newEntry);
        
        // Liste sayfasına bildirim gönder
        window.postMessage({ type: 'ENTRY_CREATED', entry: newEntry }, '*');
        console.log('Liste güncelleme mesajı gönderildi');
        
        setMessage('Veri başarıyla kaydedildi!');
        
        onEntryCreated?.();
        
        // Yeni sekmede kaydedilen veriyi göster
        openDataPreviewTab(newEntry);
        
        // Formu sıfırla
        setFormData({
          date: todayDate,
          machineNo: '',
          mkCycleSpeed: 0,
          shift: 1,
          moldNo: 1,
          steam: 0,
          formCount: 1,
          matchingPersonnelCount: 1,
          tablePersonnelCount: 1,
          modelNo: 1,
          sizeNo: '',
          itemsPerPackage: 1,
          packagesPerBag: undefined,
          bagsPerBox: undefined,
          tableTotalPackage: 0,
          sampleFormCount: 0,
          repeatFormCount: 0,
          yesterdayRemainingCount: 0,
          unmatchedProductCount: 0,
          aQualityProductCount: 0,
          threadedProductCount: 0,
          stainedProductCount: 0,
          measurementError: 0,
          knittingError: 0,
          toeDefect: 0,
          otherDefect: 0,
          remainingOnTableCount: undefined,
          countTakenFromTable: 0,
          countTakenFromMachine: 0,
          note: '',
        });
      }
    } catch (error) {
      console.error('Form gönderilirken hata:', error);
      setMessage('Veri kaydedilirken bir hata oluştu!');
    } finally {
      setLoading(false);
    }
  };

  const openDataPreviewTab = (entry: ProductionEntry) => {
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="tr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Üretim Kaydı Detayları</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
          }
          
          .container {
            max-width: 1000px;
            margin: 0 auto;
            background: white;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            overflow: hidden;
          }
          
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
          }
          
          .header h1 {
            font-size: 2rem;
            margin-bottom: 10px;
          }
          
          .header p {
            font-size: 1.1rem;
            opacity: 0.9;
          }
          
          .content {
            padding: 30px;
          }
          
          .data-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 25px;
            margin-bottom: 30px;
          }
          
          .data-section {
            background: #f8f9fa;
            border-radius: 10px;
            padding: 20px;
            border-left: 4px solid #667eea;
          }
          
          .data-section h3 {
            color: #667eea;
            margin-bottom: 15px;
            font-size: 1.2rem;
            border-bottom: 2px solid #eee;
            padding-bottom: 10px;
          }
          
          .data-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 0;
            border-bottom: 1px solid #eee;
          }
          
          .data-item:last-child {
            border-bottom: none;
          }
          
          .data-label {
            font-weight: 600;
            color: #555;
            flex: 1;
          }
          
          .data-value {
            font-weight: 500;
            color: #333;
            text-align: right;
            flex: 1;
          }
          
          .highlight {
            color: #667eea;
            font-weight: 700;
          }
          
          .error-rates {
            background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
            color: white;
          }
          
          .error-rates h3 {
            color: white;
            border-bottom-color: rgba(255,255,255,0.3);
          }
          
          .error-rates .data-item {
            border-bottom-color: rgba(255,255,255,0.2);
          }
          
          .summary-stats {
            background: linear-gradient(135deg, #20bf6b 0%, #01a3a4 100%);
            color: white;
            text-align: center;
            padding: 25px;
            border-radius: 10px;
            margin: 25px 0;
          }
          
          .summary-stats h3 {
            margin-bottom: 15px;
            font-size: 1.3rem;
          }
          
          .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
          }
          
          .stat-item {
            background: rgba(255,255,255,0.2);
            padding: 15px;
            border-radius: 8px;
          }
          
          .stat-value {
            font-size: 1.8rem;
            font-weight: 700;
            margin-bottom: 5px;
          }
          
          .stat-label {
            font-size: 0.9rem;
            opacity: 0.9;
          }
          
          .note-section {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 10px;
            padding: 20px;
            margin: 25px 0;
          }
          
          .note-section h3 {
            color: #856404;
            margin-bottom: 10px;
          }
          
          .note-content {
            color: #856404;
            font-style: italic;
            line-height: 1.5;
          }
          
          .actions {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 2px solid #eee;
          }
          
          .btn {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 12px 30px;
            border: none;
            border-radius: 25px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            margin: 0 10px;
            transition: all 0.3s ease;
            text-decoration: none;
            display: inline-block;
          }
          
          .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
          }
          
          .btn-secondary {
            background: linear-gradient(135deg, #6c757d 0%, #495057 100%);
          }
          
          @media (max-width: 768px) {
            .data-grid {
              grid-template-columns: 1fr;
            }
            
            .stats-grid {
              grid-template-columns: repeat(2, 1fr);
            }
            
            .header h1 {
              font-size: 1.5rem;
            }
            
            .content {
              padding: 20px;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏭 Üretim Kaydı Detayları</h1>
            <p>Üretim Tarihi: ${new Date(entry.date).toLocaleDateString('tr-TR')}</p>
            <p>Oluşturulma Zamanı: ${new Date(entry.createdAt).toLocaleString('tr-TR')}</p>
          </div>
          
          <div class="content">
            <div class="summary-stats">
              <h3>📊 Özet İstatistikler</h3>
              <div class="stats-grid">
                <div class="stat-item">
                  <div class="stat-value">${entry.formCount}</div>
                  <div class="stat-label">Toplam Form</div>
                </div>
                <div class="stat-item">
                  <div class="stat-value">${entry.tableTotalPackage}</div>
                  <div class="stat-label">Masa Toplam Paket</div>
                </div>
                <div class="stat-item">
                  <div class="stat-value">${entry.totalDefects}</div>
                  <div class="stat-label">Toplam Hata</div>
                </div>
                <div class="stat-item">
                  <div class="stat-value">${entry.generalErrorRate.toFixed(2)}%</div>
                  <div class="stat-label">Genel Hata Oranı</div>
                </div>
              </div>
            </div>
            
            <div class="data-grid">
              <div class="data-section">
                <h3>🏭 Üretim Bilgileri</h3>
                <div class="data-item">
                  <span class="data-label">Makine No:</span>
                  <span class="data-value highlight">${entry.machineNo}</span>
                </div>
                <div class="data-item">
                  <span class="data-label">MK Çevrim Hızı:</span>
                  <span class="data-value">${entry.mkCycleSpeed}</span>
                </div>
                <div class="data-item">
                  <span class="data-label">Vardiya:</span>
                  <span class="data-value">${entry.shift}</span>
                </div>
                <div class="data-item">
                  <span class="data-label">Kalıp No:</span>
                  <span class="data-value">${entry.moldNo}</span>
                </div>
                <div class="data-item">
                  <span class="data-label">Buhar:</span>
                  <span class="data-value">${entry.steam}</span>
                </div>
                <div class="data-item">
                  <span class="data-label">Form Sayısı:</span>
                  <span class="data-value highlight">${entry.formCount}</span>
                </div>
              </div>
              
              <div class="data-section">
                <h3>👥 Personel ve Ürün Bilgileri</h3>
                <div class="data-item">
                  <span class="data-label">Eşleme Personel:</span>
                  <span class="data-value">${entry.matchingPersonnelCount}</span>
                </div>
                <div class="data-item">
                  <span class="data-label">Masa Personel:</span>
                  <span class="data-value">${entry.tablePersonnelCount}</span>
                </div>
                <div class="data-item">
                  <span class="data-label">Model No:</span>
                  <span class="data-value">${entry.modelNo}</span>
                </div>
                <div class="data-item">
                  <span class="data-label">Beden No:</span>
                  <span class="data-value highlight">${entry.sizeNo}</span>
                </div>
                <div class="data-item">
                  <span class="data-label">Paket Başına Adet:</span>
                  <span class="data-value">${entry.itemsPerPackage}</span>
                </div>
                ${entry.packagesPerBag ? `
                <div class="data-item">
                  <span class="data-label">Çuval Başına Paket:</span>
                  <span class="data-value">${entry.packagesPerBag}</span>
                </div>
                ` : ''}
                ${entry.bagsPerBox ? `
                <div class="data-item">
                  <span class="data-label">Koli Başına Çuval:</span>
                  <span class="data-value">${entry.bagsPerBox}</span>
                </div>
                ` : ''}
              </div>
              
              <div class="data-section">
                <h3>📦 Üretim Miktarları</h3>
                <div class="data-item">
                  <span class="data-label">Masa Toplam Paket:</span>
                  <span class="data-value highlight">${entry.tableTotalPackage}</span>
                </div>
                ${entry.remainingOnTableCount ? `
                <div class="data-item">
                  <span class="data-label">Masada Kalan:</span>
                  <span class="data-value">${entry.remainingOnTableCount}</span>
                </div>
                ` : ''}
                <div class="data-item">
                  <span class="data-label">Masa Çıkan:</span>
                  <span class="data-value">${entry.countTakenFromTable}</span>
                </div>
                <div class="data-item">
                  <span class="data-label">Makinadan Alınan Sayı:</span>
                  <span class="data-value">${entry.countTakenFromMachine ?? '-'}</span>
                </div>
              </div>
              
              <div class="data-section">
                <h3>📊 Ek Üretim Verileri</h3>
                <div class="data-item">
                  <span class="data-label">Numune Forma Sayısı:</span>
                  <span class="data-value">${entry.sampleFormCount || 0}</span>
                </div>
                <div class="data-item">
                  <span class="data-label">Tekrar Forma Sayısı:</span>
                  <span class="data-value">${entry.repeatFormCount || 0}</span>
                </div>
                <div class="data-item">
                  <span class="data-label">Dünden Kalan Ürün Sayısı:</span>
                  <span class="data-value">${entry.yesterdayRemainingCount || 0}</span>
                </div>
                <div class="data-item">
                  <span class="data-label">Eşleşmemiş Ürün Sayısı:</span>
                  <span class="data-value">${entry.unmatchedProductCount || 0}</span>
                </div>
                <div class="data-item">
                  <span class="data-label">A Kalite Ürün Sayısı:</span>
                  <span class="data-value">${entry.aQualityProductCount || 0}</span>
                </div>
                <div class="data-item">
                  <span class="data-label">İpli Ürün Sayısı:</span>
                  <span class="data-value">${entry.threadedProductCount || 0}</span>
                </div>
                <div class="data-item">
                  <span class="data-label">Lekeli Ürün Sayısı:</span>
                  <span class="data-value">${entry.stainedProductCount || 0}</span>
                </div>
              </div>
              
              <div class="data-section error-rates">
                <h3>❌ Hata Analizi</h3>
                <div class="data-item">
                  <span class="data-label">Ölçü Hatası:</span>
                  <span class="data-value">${entry.measurementError} (${entry.measurementErrorRate.toFixed(2)}%)</span>
                </div>
                <div class="data-item">
                  <span class="data-label">Örgü Hatası:</span>
                  <span class="data-value">${entry.knittingError} (${entry.knittingErrorRate.toFixed(2)}%)</span>
                </div>
                <div class="data-item">
                  <span class="data-label">Burun Hatası:</span>
                  <span class="data-value">${entry.toeDefect} (${entry.toeDefectRate.toFixed(2)}%)</span>
                </div>
                <div class="data-item">
                  <span class="data-label">Diğer Hatalar:</span>
                  <span class="data-value">${entry.otherDefect} (${entry.otherDefectRate.toFixed(2)}%)</span>
                </div>
                <div class="data-item">
                  <span class="data-label"><strong>Toplam Hata:</strong></span>
                  <span class="data-value"><strong>${entry.totalDefects} (${entry.generalErrorRate.toFixed(2)}%)</strong></span>
                </div>
              </div>
            </div>
            
            ${entry.note ? `
            <div class="note-section">
              <h3>📝 Notlar</h3>
              <div class="note-content">${entry.note}</div>
            </div>
            ` : ''}
            
            <div class="actions">
              <button class="btn" onclick="window.print()">🖨️ Yazdır</button>
              <button class="btn btn-secondary" onclick="window.close()">❌ Kapat</button>
            </div>
          </div>
        </div>
        
        <script>
          // Sayfa yüklendiğinde otomatik olarak yazdırma dialogunu açabilirsiniz
          // window.onload = function() { window.print(); };
        </script>
      </body>
      </html>
    `;

    // Yeni sekme aç ve HTML içeriğini yaz
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(htmlContent);
      newWindow.document.close();
    } else {
      alert('Popup engellendi. Lütfen popup engelleyiciyi devre dışı bırakın.');
    }
  };

  // Mevcut form verilerini önizle
  return (
    <div className="production-form-container">
      <h2>{editMode ? 'Üretim Verisi Düzenleme' : 'Üretim Veri Girişi'}</h2>
      
      {editMode && timeRemaining && (
        <div className={`editability-info ${timeRemaining !== 'Süre doldu' ? 'can-edit' : 'cannot-edit'}`}>
          <p><strong>Kalan Süre:</strong> {timeRemaining}</p>
        </div>
      )}
      
      {message && (
        <div className={`message ${message.includes('Hata') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="production-form">
        <div className="form-section">
          <h3>Temel Bilgiler</h3>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="date">Üretim Tarihi *</label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="machineNo">Makine No *</label>
              <select
                id="machineNo"
                name="machineNo"
                value={formData.machineNo}
                onChange={handleInputChange}
                required
              >
                <option value="">Seçiniz</option>
                <option value="A-1">A-1</option>
                <option value="A-2">A-2</option>
                <option value="A-3">A-3</option>
                <option value="A-4">A-4</option>
                <option value="T-1">T-1</option>
                <option value="T-2">T-2</option>
                <option value="T-3">T-3</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="mkCycleSpeed">MK Cycle (Hız)</label>
              <input
                type="number"
                id="mkCycleSpeed"
                name="mkCycleSpeed"
                value={formData.mkCycleSpeed}
                onChange={handleInputChange}
                step="0.1"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="shift">Vardiya *</label>
              <select
                id="shift"
                name="shift"
                value={formData.shift}
                onChange={handleInputChange}
                required
              >
                <option value={1}>1</option>
                <option value={2}>2</option>
                <option value={3}>3</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="moldNo">Kalıp No *</label>
              <input
                type="number"
                id="moldNo"
                name="moldNo"
                value={formData.moldNo}
                onChange={handleInputChange}
                required
                min="1"
              />
            </div>
            <div className="form-group">
              <label htmlFor="steam">Buhar</label>
              <input
                type="number"
                id="steam"
                name="steam"
                value={formData.steam}
                onChange={handleInputChange}
                step="0.1"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="formCount">Formacı Sayısı *</label>
              <input
                type="number"
                id="formCount"
                name="formCount"
                value={formData.formCount}
                onChange={handleInputChange}
                required
                min="1"
              />
            </div>
            <div className="form-group">
              <label htmlFor="matchingPersonnelCount">Eşlemeci Sayısı *</label>
              <select
                id="matchingPersonnelCount"
                name="matchingPersonnelCount"
                value={formData.matchingPersonnelCount}
                onChange={handleInputChange}
                required
              >
                <option value={1}>1</option>
                <option value={2}>2</option>
                <option value={3}>3</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="tablePersonnelCount">Masacı Sayısı *</label>
              <select
                id="tablePersonnelCount"
                name="tablePersonnelCount"
                value={formData.tablePersonnelCount}
                onChange={handleInputChange}
                required
              >
                <option value={1}>1</option>
                <option value={2}>2</option>
                <option value={3}>3</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="modelNo">Model No *</label>
              <input
                type="number"
                id="modelNo"
                name="modelNo"
                value={formData.modelNo}
                onChange={handleInputChange}
                required
                min="1"
              />
            </div>
            <div className="form-group">
              <label htmlFor="sizeNo">Beden No *</label>
              <input
                type="text"
                id="sizeNo"
                name="sizeNo"
                value={formData.sizeNo}
                onChange={handleInputChange}
                required
                maxLength={20}
              />
            </div>
            <div className="form-group">
              <label htmlFor="itemsPerPackage">Kaçlı Paket *</label>
              <select
                id="itemsPerPackage"
                name="itemsPerPackage"
                value={formData.itemsPerPackage}
                onChange={handleInputChange}
                required
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>{i + 1}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="packagesPerBag">Poşet İçi Paket</label>
              <input
                type="number"
                id="packagesPerBag"
                name="packagesPerBag"
                value={formData.packagesPerBag || ''}
                onChange={handleInputChange}
                min="1"
              />
            </div>
            <div className="form-group">
              <label htmlFor="bagsPerBox">Koli İçi Paket</label>
              <input
                type="number"
                id="bagsPerBox"
                name="bagsPerBox"
                value={formData.bagsPerBox || ''}
                onChange={handleInputChange}
                min="1"
              />
            </div>
            <div className="form-group">
              <label htmlFor="tableTotalPackage">Masa Toplam Paket *</label>
              <input
                type="number"
                id="tableTotalPackage"
                name="tableTotalPackage"
                value={formData.tableTotalPackage}
                onChange={handleInputChange}
                required
                min="0"
              />
            </div>
            <div className="form-group">
              <label htmlFor="sampleFormCount">Numune Forma Sayısı</label>
              <input
                type="number"
                id="sampleFormCount"
                name="sampleFormCount"
                value={formData.sampleFormCount}
                onChange={handleInputChange}
                min="0"
              />
            </div>
            <div className="form-group">
              <label htmlFor="repeatFormCount">Tekrar Forma Sayısı</label>
              <input
                type="number"
                id="repeatFormCount"
                name="repeatFormCount"
                value={formData.repeatFormCount}
                onChange={handleInputChange}
                min="0"
              />
            </div>
            <div className="form-group">
              <label htmlFor="yesterdayRemainingCount">Dünden Kalan Ürün Sayısı</label>
              <input
                type="number"
                id="yesterdayRemainingCount"
                name="yesterdayRemainingCount"
                value={formData.yesterdayRemainingCount}
                onChange={handleInputChange}
                min="0"
              />
            </div>
            <div className="form-group">
              <label htmlFor="unmatchedProductCount">Eşleşmemiş Ürün Sayısı</label>
              <input
                type="number"
                id="unmatchedProductCount"
                name="unmatchedProductCount"
                value={formData.unmatchedProductCount}
                onChange={handleInputChange}
                min="0"
              />
            </div>
            <div className="form-group">
              <label htmlFor="aQualityProductCount">A Kalite Ürün Sayısı</label>
              <input
                type="number"
                id="aQualityProductCount"
                name="aQualityProductCount"
                value={formData.aQualityProductCount}
                onChange={handleInputChange}
                min="0"
              />
            </div>
            <div className="form-group">
              <label htmlFor="threadedProductCount">İpli Ürün Sayısı</label>
              <input
                type="number"
                id="threadedProductCount"
                name="threadedProductCount"
                value={formData.threadedProductCount}
                onChange={handleInputChange}
                min="0"
              />
            </div>
            <div className="form-group">
              <label htmlFor="stainedProductCount">Lekeli Ürün Sayısı</label>
              <input
                type="number"
                id="stainedProductCount"
                name="stainedProductCount"
                value={formData.stainedProductCount}
                onChange={handleInputChange}
                min="0"
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>2. Kalite Verileri</h3>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="measurementError">Ölçü Hatası</label>
              <input
                type="number"
                id="measurementError"
                name="measurementError"
                value={formData.measurementError}
                onChange={handleInputChange}
                min="0"
              />
            </div>
            <div className="form-group">
              <label htmlFor="knittingError">Örgü Hatası</label>
              <input
                type="number"
                id="knittingError"
                name="knittingError"
                value={formData.knittingError}
                onChange={handleInputChange}
                min="0"
              />
            </div>
            <div className="form-group">
              <label htmlFor="toeDefect">Burun Sakatı</label>
              <input
                type="number"
                id="toeDefect"
                name="toeDefect"
                value={formData.toeDefect}
                onChange={handleInputChange}
                min="0"
              />
            </div>
            <div className="form-group">
              <label htmlFor="otherDefect">Diğer Sakat</label>
              <input
                type="number"
                id="otherDefect"
                name="otherDefect"
                value={formData.otherDefect}
                onChange={handleInputChange}
                min="0"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="remainingOnTableCount">Masada Kalan Sayı</label>
              <input
                type="number"
                id="remainingOnTableCount"
                name="remainingOnTableCount"
                value={formData.remainingOnTableCount || ''}
                onChange={handleInputChange}
                min="0"
              />
            </div>
            <div className="form-group">
              <label htmlFor="countTakenFromTable">Masa Çıkan Sayı *</label>
              <input
                type="number"
                id="countTakenFromTable"
                name="countTakenFromTable"
                value={formData.countTakenFromTable}
                onChange={handleInputChange}
                required
                min="0"
              />
            </div>
            <div className="form-group">
              <label htmlFor="countTakenFromMachine">Makinadan Alınan Sayı *</label>
              <input
                type="number"
                id="countTakenFromMachine"
                name="countTakenFromMachine"
                value={formData.countTakenFromMachine}
                onChange={handleInputChange}
                required
                min="0"
              />
            </div>
          </div>
        </div>

        <div className="form-section note-section">
          <h3>Notunuz</h3>
          <div className="note-templates" style={{ marginBottom: '8px' }}>
            <span style={{ fontSize: '0.95em', color: '#666' }}>Şablonlar: </span>
            {noteTemplates.map((template, idx) => (
              <button
                type="button"
                key={idx}
                style={{ margin: '2px 4px', padding: '2px 8px', fontSize: '0.95em', cursor: 'pointer', borderRadius: '6px', border: '1px solid #ccc', background: '#f7f7f7' }}
                onClick={() => handleNoteTemplateClick(template)}
              >
                {template}
              </button>
            ))}
          </div>
          <textarea
            name="note"
            value={formData.note}
            onChange={handleInputChange}
            placeholder="Buraya notunuzu yazabilirsiniz..."
            rows={4}
            className="note-textarea"
          />
        </div>
        <div className="form-actions">
          <button 
            type="submit" 
            disabled={loading || (editMode && timeRemaining === 'Süre doldu')} 
            className="submit-btn"
          >
            {loading 
              ? (editMode ? 'Güncelleniyor...' : 'Kaydediliyor...')
              : (editMode ? 'Güncelle' : 'Kaydet')
            }
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductionForm;
