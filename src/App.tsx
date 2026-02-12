import './App.css'
//import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Pages/Login';
import Register from './Pages/Register';
import Dashboard from './Pages/Dashboard';
import Profile from './Pages/Profile';

function App() {
  //const [token, useToken] = useState(localStorage.getItem("token"));
  //const isAuth = !!token

  return(
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path = "/" element={<Navigate to="/login"/>} />
      </Routes>
    </Router>
  )
}

export default App;