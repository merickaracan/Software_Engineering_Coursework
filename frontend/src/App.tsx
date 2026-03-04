import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider, useTheme } from './components/ThemeContext';
import { ConfigProvider, theme } from "antd";
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import LeaderboardPage from './pages/LeaderboardPage';
import MyNotesPage from './pages/MyNotesPage';
import ModulesPage from './pages/ModulesPage';
import CreateNotePage from './pages/CreateNotePage';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { isDark } = useTheme();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/me", {
          method: "GET",
          credentials: "include",
        });

        setIsAuthenticated(response.ok);
      } catch (err) {
        console.log("Error checking authentication", err);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Show nothing while checking auth to avoid flashing login page
  if (isLoading) {
    return <div style={{ minHeight: "100vh" }}> Loading ... </div>;
  }


  return(
    <ThemeProvider>
    <ConfigProvider theme={{algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,}}>
      <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
        <Route path="/register" element={<Register />} />
        {isAuthenticated ? (
          <>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/my-notes" element={<MyNotesPage />} />
            <Route path="/modules" element={<ModulesPage />} />
            <Route path="/create-note" element={<CreateNotePage />} />
          </>
        ) : (
          <>
            <Route path="/dashboard" element={<Navigate to="/login" />} />
            <Route path="/profile" element={<Navigate to="/login" />} />
            <Route path="/leaderboard" element={<Navigate to="/login" />} />
            <Route path="/my-notes" element={<Navigate to="/login" />} />
            <Route path="/modules" element={<Navigate to="/login" />} />
            <Route path="/create-note" element={<Navigate to="/login" />} />
          </>
        )}
      </Routes>
    </Router>
    </ConfigProvider>
    </ThemeProvider>
  );
}

export default App;