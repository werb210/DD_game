import React from 'react'
import ReactDOM from 'react-dom/client'
import Game from '../game.jsx'

if (!window.storage) {
  window.storage = {
    async get(key) {
      const raw = localStorage.getItem(key);
      if (raw === null) throw new Error(`Key not found: ${key}`);
      return { key, value: raw };
    },
    async set(key, value) {
      localStorage.setItem(key, value);
      return { key, value };
    },
    async delete(key) {
      localStorage.removeItem(key);
      return { key, deleted: true };
    },
    async list(prefix) {
      const keys = Object.keys(localStorage).filter((k) => !prefix || k.startsWith(prefix));
      return { keys, prefix };
    },
  };
}

window.__ANTHROPIC_API_KEY__ = import.meta.env.VITE_ANTHROPIC_API_KEY

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Game />
  </React.StrictMode>
)
