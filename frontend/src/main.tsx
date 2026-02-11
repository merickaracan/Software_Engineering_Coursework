import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import "antd/dist/reset.css"
import App from './App.tsx'
// import './styles/index.css'
import function_list from './test_backend.js'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)


// Testing functions
function_list.forEach(element => {
  element()
});
