import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import AvatarSelection from './pages/AvatarSelection';
import Landing from './pages/Landing';
import QuestBuilder from './pages/QuestBuilder';
import Matchmaking from './pages/Matchmaking';
import Squad from './pages/Squad';
import MissionResults from './pages/MissionResults';
import Dashboard from './pages/Dashboard';
import Leaderboard from './pages/Leaderboard';

import { AuthProvider, useAuth } from './context/AuthContext';

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      <Route path="/avatar" element={<ProtectedRoute><AvatarSelection /></ProtectedRoute>} />
      <Route path="/quest-builder" element={<ProtectedRoute><QuestBuilder /></ProtectedRoute>} />
      <Route path="/matchmaking" element={<ProtectedRoute><Matchmaking /></ProtectedRoute>} />
      <Route path="/mission" element={<ProtectedRoute><Squad /></ProtectedRoute>} />
      <Route path="/results" element={<ProtectedRoute><MissionResults /></ProtectedRoute>} />
      <Route path="/command-center" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
