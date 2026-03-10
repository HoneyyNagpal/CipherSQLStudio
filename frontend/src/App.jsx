import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/common/Navbar';
import AssignmentList from './components/AssignmentList/AssignmentList';
import AssignmentAttempt from './components/AssignmentAttempt/AssignmentAttempt';
import AuthModal from './components/Auth/AuthModal';
import './styles/main.scss';

const AppContent = () => {
  const [authModal, setAuthModal] = useState(null); // null | 'login' | 'signup'

  return (
    <BrowserRouter>
      <Navbar onAuthClick={(mode) => setAuthModal(mode)} />

      <Routes>
        <Route path="/" element={<AssignmentList />} />
        <Route path="/assignment/:id" element={<AssignmentAttempt />} />
        <Route
          path="*"
          element={
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem', padding: '2rem', color: '#8b949e', fontFamily: 'monospace' }}>
              <span style={{ fontSize: '3rem' }}>404</span>
              <span>Page not found</span>
              <a href="/" style={{ color: '#58a6ff', fontSize: '0.875rem' }}>← Go home</a>
            </div>
          }
        />
      </Routes>

      {authModal && (
        <AuthModal
          mode={authModal}
          onClose={() => setAuthModal(null)}
        />
      )}
    </BrowserRouter>
  );
};

const App = () => (
  <AuthProvider>
    <AppContent />
  </AuthProvider>
);

export default App;
