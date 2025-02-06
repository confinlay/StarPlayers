'use client';
import React, { useState, useEffect, useRef } from 'react';

// Song metadata
const songTitles = {
  "AgainstAllOdds": { title: "Against All Odds", artist: "Inspirational Beats" },
  "AlienQueen": { title: "Alien Queen", artist: "Space Vibes" },
  "ANewBeginning": { title: "A New Beginning", artist: "Fresh Start" },
  "BeTheOne": { title: "Be The One", artist: "Motivational Tracks" },
  "Dreams": { title: "Dreams", artist: "Night Sounds" },
  "Elevate": { title: "Elevate", artist: "Up & Above" },
  "GetToYou": { title: "Get To You", artist: "Journey On" },
  "GoingHigher": { title: "Going Higher", artist: "Sky High" },
  "Higher": { title: "Higher", artist: "Peak Performance" },
  "ITry": { title: "I Try", artist: "Deep Focus" },
  "Summer": { title: "Summer", artist: "Seasonal Vibes" },
  "Sunny": { title: "Sunny", artist: "Good Days" },
  "ThereForYou": { title: "There For You", artist: "Support System" },
  "Ukelele": { title: "Ukelele", artist: "Island Tunes" },
  "Waterfall": { title: "Waterfall", artist: "Nature Sounds" }
};
const songs = Object.keys(songTitles);
const noStarsMessage = "You haven't starred any songs yet! Star a few songs, and then try again.";
const baseUrl = '/StarPlayers';

// Helper: Fisher-Yates shuffle that returns a *new* array
function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Return the array of songs that are relevant for the current mode
function getSongPool(mode, starPlayers, shuffledSongs, shuffledStars) {
  if (mode === 'SHUFFLE') return shuffledSongs;
  if (mode === 'STAR')    return shuffledStars;
  return songs; // NORMAL
}

// Figure out the key for the currently playing track
function getCurrentSongKey({ mode, currentSongIndex, manual }, starPlayers, shuffledSongs, shuffledStars) {
  // If user manually clicked a song, always index into the normal list
  if (manual) {
    return songs[currentSongIndex];
  }
  const pool = getSongPool(mode, starPlayers, shuffledSongs, shuffledStars);
  return pool[currentSongIndex % pool.length];
}

export default function Player() {
  const [playerState, setPlayerState] = useState({
    currentSongIndex: 0,
    isPlaying: false,
    manual: false,
    mode: 'NORMAL',      // 'NORMAL', 'SHUFFLE', 'STAR'
    pendingMode: null    // Queued mode to apply on next song change
  });

  // We keep two separate shuffled arrays:
  const [shuffledSongs, setShuffledSongs] = useState([]); 
  const [shuffledStars, setShuffledStars] = useState([]);

  const [starPlayers, setStarPlayers] = useState(new Set());
  const audioRef = useRef(null);

  // Load star players from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('starPlayers');
    if (stored) {
      setStarPlayers(new Set(JSON.parse(stored)));
    }
  }, []);

  // Persist starPlayers changes
  useEffect(() => {
    localStorage.setItem('starPlayers', JSON.stringify(Array.from(starPlayers)));
  }, [starPlayers]);

  // Update the audio src whenever the actual current song changes
  useEffect(() => {
    const currentSongKey = getCurrentSongKey(playerState, starPlayers, shuffledSongs, shuffledStars);
    if (audioRef.current) {
      const currentSrcName = audioRef.current.src.split('/').pop().split('.')[0];
      if (currentSrcName !== currentSongKey) {
        audioRef.current.src = `${baseUrl}/music/${currentSongKey}.mp3`;
        if (playerState.isPlaying) {
          audioRef.current.play();
        }
      }
    }
  }, [playerState.currentSongIndex, playerState.manual]);

  // --------------
  // Player controls
  // --------------
  const playSong = () => {
    if (audioRef.current) {
      audioRef.current.play();
      setPlayerState(prev => ({ ...prev, isPlaying: true }));
    }
  };

  const pauseSong = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setPlayerState(prev => ({ ...prev, isPlaying: false }));
    }
  };

  const handlePlayPause = () => {
    if (!audioRef.current) return;
    audioRef.current.paused ? playSong() : pauseSong();
  };

  // --------------
  // Song navigation
  // --------------
  function applyPendingModeAndGetPool(prev) {
    // If there's a pending mode, apply it now
    let newMode = prev.mode;
    let newShuffled = [...shuffledSongs];
    let newShuffledStars = [...shuffledStars];

    if (prev.pendingMode) {
      newMode = prev.pendingMode;

      // If we're about to switch to SHUFFLE, generate a fresh shuffle of all songs
      if (newMode === 'SHUFFLE') {
        newShuffled = shuffleArray(songs);
      }
      // If switching to STAR, shuffle the star list
      if (newMode === 'STAR') {
        const starArray = Array.from(starPlayers);
        newShuffledStars = shuffleArray(starArray);
      }
    }

    // Build the pool for the newMode
    const pool = getSongPool(newMode, starPlayers, newShuffled, newShuffledStars);

    // If STAR is requested but no starred songs, revert to NORMAL
    if (newMode === 'STAR' && pool.length === 0) {
      alert("No starred songs available.");
      newMode = 'NORMAL';
    }

    return { newMode, newShuffled, newShuffledStars, pool };
  }

  const nextSong = () => {
    setPlayerState(prev => {
      const { newMode, newShuffled, newShuffledStars, pool } = applyPendingModeAndGetPool(prev);
      const nextIndex = (prev.currentSongIndex + 1) % pool.length;

      setShuffledSongs(newShuffled);
      setShuffledStars(newShuffledStars);

      return {
        ...prev,
        currentSongIndex: nextIndex,
        mode: newMode,
        pendingMode: null, // Done applying
        manual: false
      };
    });
  };

  const prevSong = () => {
    setPlayerState(prev => {
      const { newMode, newShuffled, newShuffledStars, pool } = applyPendingModeAndGetPool(prev);
      let newIndex = prev.currentSongIndex - 1;
      if (newIndex < 0) {
        newIndex = pool.length - 1;
      }

      setShuffledSongs(newShuffled);
      setShuffledStars(newShuffledStars);

      return {
        ...prev,
        currentSongIndex: newIndex,
        mode: newMode,
        pendingMode: null,
        manual: false
      };
    });
  };

  // --------------
  // Mode toggles (queued)
  // --------------
  const toggleShuffle = () => {
    setPlayerState(prev => {
      const isActiveOrPendingShuffle =
        (prev.mode === 'SHUFFLE' && !prev.pendingMode) ||
        prev.pendingMode === 'SHUFFLE';
      return { ...prev, pendingMode: isActiveOrPendingShuffle ? 'NORMAL' : 'SHUFFLE' };
    });
  };

  const toggleStarPlay = () => {
    setPlayerState(prev => {
      const isActiveOrPendingStar =
        (prev.mode === 'STAR' && !prev.pendingMode) ||
        prev.pendingMode === 'STAR';
      
      // Check if we're trying to switch to STAR mode
      const targetMode = isActiveOrPendingStar ? 'NORMAL' : 'STAR';
      
      // If switching to STAR mode, verify we have starred songs
      if (targetMode === 'STAR' && starPlayers.size === 0) {
        alert(noStarsMessage);
        return prev; // Keep current state unchanged
      }

      return { ...prev, pendingMode: targetMode };
    });
  };

  // Toggle star for a given song
  const toggleStar = (song) => {
    setStarPlayers(prev => {
      const newSet = new Set(prev);
      newSet.has(song) ? newSet.delete(song) : newSet.add(song);
      return newSet;
    });
  };

  // The currently playing song key
  const currentSong = getCurrentSongKey(playerState, starPlayers, shuffledSongs, shuffledStars);
  return (
    <div className="h-screen flex items-center justify-center bg-zinc-900 text-zinc-50">
      <div className="w-[min(700px,90vw)] bg-zinc-800 rounded-lg shadow-2xl">
        {/* Fixed Player Section */}
        <div className="p-4">
          {/* Current Song Display */}
          <div className="mb-3">
            <div className="flex items-center gap-3 bg-white/5 rounded-lg p-3">
              <div className="w-[min(100px,20vw)] h-[min(100px,20vw)] relative">
                <img
                  src={`${baseUrl}/images/${currentSong}.jpg`}
                  alt={`${songTitles[currentSong].title} Cover`}
                  className="rounded-md object-cover w-full h-full"
                />
              </div>
              <div>
                <h1 className="text-xl font-bold">{songTitles[currentSong].title}</h1>
                <p className="text-zinc-400 text-sm">{songTitles[currentSong].artist}</p>
              </div>
            </div>
          </div>

          {/* Playback Controls */}
          <div className="flex flex-col items-center gap-3 mb-3">
            <div className="flex items-center gap-4">
              <button 
                className={`p-1.5 rounded-full transition-colors ${
                  playerState.pendingMode !== null
                    ? playerState.pendingMode === 'SHUFFLE' ? 'text-green-500 hover:text-green-300' : 'text-zinc-400 hover:text-white'
                    : playerState.mode === 'SHUFFLE' ? 'text-green-500 hover:text-green-300' : 'text-zinc-400 hover:text-white'
                }`}
                onClick={toggleShuffle}
                title="Shuffle (queued)"
              >
                <i className="fas fa-random text-lg"></i>
              </button>
              
              <button 
                className="p-1.5 text-zinc-400 hover:text-white active:text-green-500 transition-colors" 
                onClick={prevSong}
                title="Previous"
              >
                <i className="fas fa-backward text-lg"></i>
              </button>
              
              <button 
                className="p-3 bg-green-500 rounded-full hover:scale-110 active:bg-green-600 transition-all"
                onClick={handlePlayPause}
                title="Play / Pause"
              >
                <i className={`fas ${playerState.isPlaying ? 'fa-pause' : 'fa-play'} text-black text-lg`}></i>
              </button>
              
              <button 
                className="p-1.5 text-zinc-400 hover:text-white active:text-green-500 transition-colors" 
                onClick={nextSong}
                title="Next"
              >
                <i className="fas fa-forward text-lg"></i>
              </button>
              
              <button 
                className={`p-1.5 rounded-full transition-colors ${
                  playerState.pendingMode !== null
                    ? playerState.pendingMode === 'STAR' ? 'text-yellow-500 hover:text-yellow-300' : 'text-zinc-400 hover:text-white'
                    : playerState.mode === 'STAR' ? 'text-yellow-500 hover:text-yellow-300' : 'text-zinc-400 hover:text-white'
                }`}
                onClick={toggleStarPlay}
                title="StarPlay (queued)"
              >
                <i className="fas fa-star text-lg"></i>
              </button>
            </div>
          </div>
        </div>

        {/* Scrollable Song List */}
        <div className="max-h-[min(calc(95vh-280px),600px)] overflow-y-auto">
          <div className="p-4 pt-0">
            <h2 className="text-base font-bold mb-2">Songs</h2>
            <div className="bg-zinc-800/50 rounded-lg">
              {songs.map((song, index) => (
                <div
                  key={song}
                  onClick={() => {
                    setPlayerState(prev => ({
                      ...prev,
                      currentSongIndex: index,
                      manual: true
                    }));
                    playSong();
                  }}
                  className={`flex items-center justify-between p-2 hover:bg-white/10 cursor-pointer transition-colors ${
                    song === currentSong ? 'bg-white/20' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-zinc-400 w-5 text-sm">{index + 1}</span>
                    <div>
                      <p className="font-medium text-left text-sm">{songTitles[song].title}</p>
                      <p className="text-xs text-zinc-400 text-left">{songTitles[song].artist}</p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleStar(song);
                    }}
                    className="p-1.5 hover:text-yellow-500 transition-colors"
                    title="Toggle Star"
                  >
                    <i className={`${starPlayers.has(song) ? 'fas text-yellow-500' : 'far'} fa-star text-sm`}></i>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Audio Element */}
      <audio id="audio" ref={audioRef} onEnded={nextSong} className="hidden" />
    </div>
  );
}
