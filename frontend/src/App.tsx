// import './styles/App.css'
import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import { ThemeProvider, useTheme } from './components/ThemeContext';
import { ConfigProvider, theme } from "antd";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
    return <div style={{ minHeight: "100vh" }}></div>;
  }

  const { isDark } = useTheme();

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
          </>
        ) : (
          <>
            <Route path="/dashboard" element={<Navigate to="/login" />} />
            <Route path="/profile" element={<Navigate to="/login" />} />
          </>
        )}
      </Routes>
    </Router>
    </ConfigProvider>
    </ThemeProvider>
  );
}

export default App;