import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/" className="navbar-logo">🍲 FoodBridge</Link>
      </div>
      <div className="navbar-links">
        {user.role === 'donor' && (
          <Link to="/donor" className="navbar-link">Dashboard</Link>
        )}
        {user.role === 'receiver' && (
          <Link to="/receiver" className="navbar-link">Dashboard</Link>
        )}
        {user.role === 'admin' && (
          <Link to="/admin" className="navbar-link">Admin Panel</Link>
        )}
        <span className="navbar-user">
          {user.name} <span className="navbar-role">({user.role})</span>
        </span>
        <button className="navbar-logout" onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  );
};

export default Navbar;
