//Login page
//import axios from "axios";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ConfigProvider, Flex } from 'antd';
import { useResponsive } from 'antd-style';
import React from "react";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const { xxl } = useResponsive();
    

const handleLogin = async (e: React.ChangeEvent<any>) => {
    e.preventDefault();
    setError("");
    setLoading(true);


    try{ 
      const result = await axios.post("https://meric-trackerknex.mhkb1d.easypanel.host/api/auth/signin" ,{
        email: email,
        password: password,
      });
      
      const { user , token } = result.data;

      if(result.status = 200){
        console.log("Login successful");

        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("token", token);

        navigate("/Dashboard");
      }
      else{
        setError("Unexpected error");
      }
    } catch(error){
      setError("Invalid mail or pasword.");
      console.error("Login error: ", error);
    }finally{
      setLoading(false);
    }
  };

  //const Login: React.FC = () => {
    

    return(
      <ConfigProvider componentSize={xxl ? 'middle' : 'small'}>
      <Flex vertical gap="small">
        <form onSubmit={handleLogin} className="mt-4 space-y-4 w-full max-w-md mx-auto">
          <h2 className="text-2xl font-bold mb-2">Login</h2>

          {error && <p className="text-red-500">{error}</p>}

          <div className="text-left">
            <label className="block font-medium">Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 rounded-lg border border-gray-400 focus:ring focus:ring-blue-500"
            />
          </div>

          <div className="text-left">
            <label className="block font-medium">Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 rounded-lg border border-gray-400 focus:ring focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          <p className="mt-4 text-sm text-center">
            New user?{" "}
            <a href="/register" className="text-blue-600 font-semibold underline">
              Sign up
            </a>
          </p>
        </form>
      </Flex>
    </ConfigProvider>
  );
 }



export default Login;
