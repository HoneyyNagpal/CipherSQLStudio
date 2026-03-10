import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Navbar.scss';

const Navbar = ({ onAuthClick }) => {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <Link to="/" className="navbar__brand">
        <div className="navbar__brand-icon">{'>'}_</div>
        <span className="navbar__brand-name">
          Cipher<span>SQL</span>Studio
        </span>
      </Link>

      <div className="navbar__actions">
        {user ? (
          <div className="navbar__user">
            <span className="navbar__user-name">@{user.username}</span>
            <button className="btn btn--secondary btn--sm" onClick={logout}>
              Logout
            </button>
          </div>
        ) : (
          <>
            <button className="btn btn--ghost btn--sm" onClick={() => onAuthClick('login')}>
              Log in
            </button>
            <button className="btn btn--primary btn--sm" onClick={() => onAuthClick('signup')}>
              Sign up
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
