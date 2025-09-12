import { useParams } from 'react-router-dom';
import ProductionForm from './ProductionForm';

const EditProductionEntry = () => {
  const { id } = useParams<{ id: string }>();
  
  if (!id) {
    return <div>Geçersiz kayıt ID'si</div>;
  }

  return (
    <div className="dashboard dashboard-full">
      <ProductionForm 
        editMode={true} 
        entryId={Number(id)}
        onEntryUpdated={() => {
          // Güncelleme sonrası yapılacak işlemler
          console.log('Kayıt güncellendi');
        }}
      />
    </div>
  );
};

export default EditProductionEntry;
