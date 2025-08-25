import { useState } from 'react';
import { productionApi } from '../services/api';
import type { ProductionEntryDto } from '../services/api';
import './ProductionForm.css';

interface ProductionFormProps {
  onEntryCreated: () => void;
}

const ProductionForm = ({ onEntryCreated }: ProductionFormProps) => {
  const [formData, setFormData] = useState<ProductionEntryDto>({
    date: new Date().toISOString().split('T')[0],
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
  });

  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // String olarak kalması gereken alanlar
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
      
      // Boş alanları kontrol et
      const requiredFields = ['machineNo', 'sizeNo'];
      const missingFields = requiredFields.filter(field => !formData[field as keyof ProductionEntryDto]);
      
      if (missingFields.length > 0) {
        setMessage(`Gerekli alanlar eksik: ${missingFields.join(', ')}`);
        setLoading(false);
        return;
      }
      
      await productionApi.createEntry(formData, selectedPhoto || undefined);
      setMessage('Veri başarıyla kaydedildi!');
      
      // Formu sıfırla
      setFormData({
        date: new Date().toISOString().split('T')[0],
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
      });

      // Foto seçimini sıfırla
      setSelectedPhoto(null);
      // File input'u da sıfırla
      const photoInput = document.getElementById('photo') as HTMLInputElement;
      if (photoInput) {
        photoInput.value = '';
      }

      onEntryCreated();
    } catch (error: unknown) {
      console.error('API Error:', error);
      
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response: { data: unknown } };
        console.error('Full Error response:', axiosError.response.data);
        
        // Error detaylarını ayrı ayrı log'la
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
      <h2>Üretim Veri Girişi</h2>
      
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
              <label htmlFor="date">Tarih *</label>
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
              <input
                type="text"
                id="machineNo"
                name="machineNo"
                value={formData.machineNo}
                onChange={handleInputChange}
                required
                maxLength={10}
              />
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
              <label htmlFor="formCount">Forma Sayısı *</label>
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
              <input
                type="number"
                id="matchingPersonnelCount"
                name="matchingPersonnelCount"
                value={formData.matchingPersonnelCount}
                onChange={handleInputChange}
                required
                min="1"
              />
            </div>
            <div className="form-group">
              <label htmlFor="tablePersonnelCount">Masacı Sayısı *</label>
              <input
                type="number"
                id="tablePersonnelCount"
                name="tablePersonnelCount"
                value={formData.tablePersonnelCount}
                onChange={handleInputChange}
                required
                min="1"
              />
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
              <input
                type="number"
                id="itemsPerPackage"
                name="itemsPerPackage"
                value={formData.itemsPerPackage}
                onChange={handleInputChange}
                required
                min="1"
              />
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
          <h3>Fotoğraf (İsteğe Bağlı)</h3>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="photo">Üretim Fotoğrafı</label>
              <input
                type="file"
                id="photo"
                name="photo"
                accept="image/*"
                onChange={handlePhotoChange}
              />
              {selectedPhoto && (
                <p className="photo-info">Seçilen dosya: {selectedPhoto.name}</p>
              )}
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

        <div className="form-actions">
          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductionForm;
