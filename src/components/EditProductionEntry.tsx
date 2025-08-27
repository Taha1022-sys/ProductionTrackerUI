import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import ProductionForm from './ProductionForm';
import { productionApi } from '../services/api';

const EditProductionEntry = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const checkEditabilityAsync = async () => {
      if (!id) {
        setError('Geçersiz kayıt ID');
        setLoading(false);
        return;
      }

      try {
        const editInfo = await productionApi.checkEditability(parseInt(id));
        if (!editInfo.canEdit) {
          setError(`Bu kayıt düzenlenemez: ${editInfo.editStatus}`);
        }
      } catch (error) {
        console.error('Düzenleme kontrolü hatası:', error);
        setError('Kayıt düzenleme kontrolü yapılamadı');
      } finally {
        setLoading(false);
      }
    };

    checkEditabilityAsync();
  }, [id]);

  const handleEntryUpdated = () => {
    // Başarılı güncelleme sonrası geçmiş sayfasına yönlendir
    navigate('/history');
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Yükleniyor...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div style={{ color: 'red', marginBottom: '1rem' }}>
          <h3>Hata</h3>
          <p>{error}</p>
        </div>
        <button 
          onClick={() => navigate('/history')}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Geçmiş Kayıtlara Dön
        </button>
      </div>
    );
  }

  return (
    <div>
      <ProductionForm 
        editMode={true}
        entryId={parseInt(id!)}
        onEntryUpdated={handleEntryUpdated}
      />
    </div>
  );
};

export default EditProductionEntry;
