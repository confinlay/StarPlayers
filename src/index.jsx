'use client';
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/main.css';

const rootElem = document.getElementById('root');
if (rootElem) {
  const root = createRoot(rootElem);
  root.render(<App />);
} 