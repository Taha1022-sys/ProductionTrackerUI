import { useState, useEffect } from 'react';
import { productionApi } from '../services/api';
import type { ProductionEntryDto, ProductionEntryUpdateDto, EditabilityCheckDto } from '../services/api';
import './ProductionForm.css';

interface ProductionFormProps {
  onEntryCreated?: () => void;
  editMode?: boolean;
  entryId?: number;
  onEntryUpdated?: () => void;
}

const ProductionForm = ({ onEntryCreated, editMode = false, entryId, onEntryUpdated }: ProductionFormProps) => {
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
    measurementError: 0,
    knittingError: 0,
    toeDefect: 0,
    otherDefect: 0,
    remainingOnTableCount: undefined,
    countTakenFromTable: 0,
    note: '',
  });

  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [editabilityInfo, setEditabilityInfo] = useState<EditabilityCheckDto | null>(null);
  const [deleteCurrentPhoto, setDeleteCurrentPhoto] = useState(false);
  const [currentPhotoPath, setCurrentPhotoPath] = useState<string>('');
  const [entryCreatedAt, setEntryCreatedAt] = useState<string>('');
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  // Kalan süreyi hesapla
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

  // Gerçek zamanlı süre güncelleme
  useEffect(() => {
    if (editMode && entryCreatedAt) {
      const interval = setInterval(() => {
        const remaining = calculateTimeRemaining(entryCreatedAt);
        setTimeRemaining(remaining);
        
        // Süre dolduğunda editability'yi güncelle
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
          date: entry.date.split('T')[0], // ISO formatından sadece tarihi al
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
          measurementError: entry.measurementError,
          knittingError: entry.knittingError,
          toeDefect: entry.toeDefect,
          otherDefect: entry.otherDefect,
          remainingOnTableCount: entry.remainingOnTableCount,
          countTakenFromTable: entry.countTakenFromTable,
        });
        if (entry.photoPath) {
          setCurrentPhotoPath(entry.photoPath);
        }
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
    if (name === 'date') {
      return;
    }
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

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedPhoto(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      console.log('Gönderilen form data:', formData);
      console.log('Seçilen foto:', selectedPhoto?.name);
      
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
          ...formData,
          deleteCurrentPhoto: deleteCurrentPhoto
        };
        
        await productionApi.updateEntry(entryId, updateData, selectedPhoto || undefined);
        setMessage('Veri başarıyla güncellendi!');
        onEntryUpdated?.();
      } else {
        // Yeni kayıt oluşturma
        await productionApi.createEntry(formData, selectedPhoto || undefined);
        setMessage('Veri başarıyla kaydedildi!');
        onEntryCreated?.();
        
        // Formu sıfırla (sadece yeni kayıt modunda)
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
          measurementError: 0,
          knittingError: 0,
          toeDefect: 0,
          otherDefect: 0,
          remainingOnTableCount: undefined,
          countTakenFromTable: 0,
          note: '',
        });

        setSelectedPhoto(null);
        const photoInput = document.getElementById('photo') as HTMLInputElement;
        if (photoInput) {
          photoInput.value = '';
        }
      }
    } catch (error: unknown) {
      console.error('API Error:', error);
      
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response: { data: unknown } };
        console.error('Full Error response:', axiosError.response.data);
        
        const errorData = axiosError.response.data as { errors?: Record<string, string[]> };
        if (errorData.errors) {
          console.error('Validation errors:', errorData.errors);
          Object.keys(errorData.errors).forEach(key => {
            console.error(`- ${key}:`, errorData.errors![key]);
          });
        }
        
        setMessage('Hata oluştu: ' + JSON.stringify(axiosError.response.data, null, 2));
      } else {
        const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
        setMessage('Hata oluştu: ' + errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

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
              <label htmlFor="date">Tarih (Sabit - Bugün)</label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                required
                disabled
                style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
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
          </div>
        </div>

        {editMode ? (
          // Düzenleme modunda fotoğraf yönetimi
          <div className="form-section">
            <h3>Fotoğraf Yönetimi</h3>
            {currentPhotoPath && !deleteCurrentPhoto && (
              <div className="current-photo">
                <p>Mevcut Fotoğraf:</p>
                <img 
                  src={productionApi.getPhotoUrl(currentPhotoPath)} 
                  alt="Mevcut fotoğraf" 
                  style={{ maxWidth: '400px', maxHeight: '300px', marginBottom: '10px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                />
                <div>
                  <label>
                    <input
                      type="checkbox"
                      checked={deleteCurrentPhoto}
                      onChange={(e) => setDeleteCurrentPhoto(e.target.checked)}
                    />
                    Mevcut fotoğrafı sil
                  </label>
                </div>
              </div>
            )}
            <div className="form-group">
              <label htmlFor="photo">
                Yeni Fotoğraf Yükle
              </label>
              <input
                type="file"
                id="photo"
                name="photo"
                accept="image/*"
                onChange={handlePhotoChange}
              />
              {selectedPhoto && (
                <p className="selected-file">Seçilen: {selectedPhoto.name}</p>
              )}
            </div>
          </div>
        ) : (
          // Yeni kayıt modunda fotoğraf yükleme
          <div className="form-section">
            <h3>Fotoğraf (İsteğe Bağlı)</h3>
            <div className="form-group">
              <label htmlFor="photo">
                Fotoğraf Yükle
              </label>
              <input
                type="file"
                id="photo"
                name="photo"
                accept="image/*"
                onChange={handlePhotoChange}
              />
              {selectedPhoto && (
                <p className="selected-file">Seçilen: {selectedPhoto.name}</p>
              )}
            </div>
          </div>
        )}

        <div className="form-section note-section">
          <h3>Notunuz</h3>
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
