import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProductionForm from './components/ProductionForm';
import ProductionView from './components/ProductionView';
import ProductionList from './components/ProductionList';
// import Dashboard from './components/Dashboard'; // Geçici olarak devre dışı
import EditProductionEntry from './components/EditProductionEntry';
import Navigation from './components/Navigation';
import './App.css';

function App() {

  return (
    <Router>
      <div className="app">
        <header className="app-header">
          <h1>Üretim Takip Sistemi</h1>
        </header>
        
        <Navigation />
        
        <main className="app-main full-width">
          <Routes>
            {/* <Route path="/dashboard" element={<Dashboard />} /> */} {/* Geçici olarak devre dışı */}
            <Route 
              path="/" 
              element={
                <div className="dashboard dashboard-full">
                  <ProductionForm />
                </div>
              } 
            />
            <Route path="/records" element={<ProductionList />} />
            <Route path="/view/:id" element={<ProductionView />} />
            <Route path="/edit/:id" element={<EditProductionEntry />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;