import './App.css'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, theme } from 'antd';
import { ThemeProvider, useTheme } from './Components/ThemeContext';
import Login from './Pages/Login';
import Register from './Pages/Register';
import Dashboard from './Pages/Dashboard';
import Profile from './Pages/Profile';
import LeaderboardPage from './Pages/LeaderboardPage';
import MyNotesPage from './Pages/MyNotesPage';
import ModulesPage from './Pages/ModulesPage';
import CreateNotePage from './Pages/CreateNotePage';

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
