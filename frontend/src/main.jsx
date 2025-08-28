import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'

// Note: AWS Amplify configuration removed to prevent global is not defined error
// To re-enable, uncomment the lines below and ensure proper polyfills:
// import { Amplify } from 'aws-amplify'
// import awsconfig from './aws-exports.js'
// Amplify.configure(awsconfig)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)