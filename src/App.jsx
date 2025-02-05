'use client';
import React from 'react';
import Player from './components/Player';

export default function App() {
  return (
    <div>
      <header>
        <h1>Star Players</h1>
      </header>
      <main>
        <Player />
      </main>
      <footer>
        <p>Created by Conor Finlay</p>
      </footer>
    </div>
  );
} 