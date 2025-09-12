import { Link, useLocation } from 'react-router-dom';
import './Navigation.css';

const Navigation = () => {
  const location = useLocation();

  return (
    <nav className="navigation">
      <div className="nav-container">
        {/* Dashboard geçici olarak devre dışı
        <Link 
          to="/dashboard" 
          className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}
        >
          📊 Dashboard
        </Link>
        */}
        
        <Link 
          to="/" 
          className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
        >
          ➕ Veri Girişi
        </Link>
        
        <Link 
          to="/records" 
          className={`nav-link ${location.pathname === '/records' ? 'active' : ''}`}
        >
          📋 Kayıt Listesi
        </Link>
      </div>
    </nav>
  );
};

export default Navigation;
