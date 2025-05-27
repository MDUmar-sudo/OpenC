import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './components/App';
import { Principal } from "@dfinity/principal";
import './index.css';

// This is for testing purposes only.
// Replace with the actual user ID when deploying or testing in production.
const CURRENT_USER_ID = Principal.fromText("2vxsx-fae");
export default CURRENT_USER_ID;

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
