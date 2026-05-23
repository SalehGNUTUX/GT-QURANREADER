import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { initCapacitor } from './platform/capacitor-init';
import '@gt-quranreader/ui/fonts.css';
import '@gt-quranreader/ui/styles';

void initCapacitor();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
