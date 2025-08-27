import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import { useState, useEffect } from 'react';
import ProductionForm from './components/ProductionForm';
// import ProductionSummary from './components/ProductionSummary';
import HistoryView from './components/HistoryView';
import ProductionView from './components/ProductionView';
import EditProductionEntry from './components/EditProductionEntry';
import Navigation from './components/Navigation';
// import type { ProductionSummary as SummaryType } from './services/api';
import './App.css';

function App() {
  // const [summary, setSummary] = useState<SummaryType | null>(null);
  // const [loading, setLoading] = useState(true);

  // useEffect(() => {
  //   loadSummary();
  // }, []);

  // const loadSummary = async () => {
  //   try {
  //     setLoading(true);
  //     const { productionApi } = await import('./services/api');
  //     const summaryData = await productionApi.getCurrentSummary();
  //     setSummary(summaryData);
  //   } catch (error) {
  //     console.error('Özet verileri yüklenirken hata:', error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // const handleEntryCreated = () => {
  //   loadSummary();
  // };

  return (
    <Router>
      <div className="app">
        <header className="app-header">
          <h1>Üretim Takip Sistemi</h1>
        </header>
        
        <Navigation />
        
        <main className="app-main full-width">
          <Routes>
            <Route 
              path="/" 
              element={
                <div className="dashboard dashboard-full">
                  <ProductionForm />
                  {/* <ProductionSummary summary={summary} loading={loading} /> */}
                </div>
              } 
            />
            <Route path="/history" element={<HistoryView />} />
            <Route path="/view/:id" element={<ProductionView />} />
            <Route path="/edit/:id" element={<EditProductionEntry />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;