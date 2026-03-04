import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, theme } from 'antd';
import { ThemeProvider, useTheme } from './components/ThemeContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import LeaderboardPage from './pages/LeaderboardPage';
import MyNotesPage from './pages/MyNotesPage';
import ModulesPage from './pages/ModulesPage';
import CreateNotePage from './pages/CreateNotePage';

function AppRoutes() {
  const { isDark } = useTheme();

  return(
    <ConfigProvider
      theme={{
        algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
      }}
    >
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/my-notes" element={<MyNotesPage />} />
          <Route path="/modules" element={<ModulesPage />} />
          <Route path="/create-note" element={<CreateNotePage />} />
          <Route path = "/" element={<Navigate to="/login"/>} />
        </Routes>
      </Router>
    </ConfigProvider>
  )
}

function App() {
  return (
    <ThemeProvider>
      <AppRoutes />
    </ThemeProvider>
  )
}

export default App;
