
# Star Players

This is a simple project I put together to learn a bit more about frontend development.
It's a Spotify-esque music player with a new feature - _Star Players_.

<a href="https://conorfinlay.me/star-players" target="_blank" rel="noopener noreferrer">
  <img src="https://conorfinlay.me/Star_players_screenshot.png" alt="Star Players Screenshot" class="rounded-lg" />
  <figcaption class="text-center mt-2">Screengrab of the app (click to try it out!)</figcaption>
</a>


The idea for the feature came from an observation I had - when organising my music in 
playlists, I would often create two copies of the same playlist. One contained all of the songs
that matched the vibe I was going for, and the other was a subset of that playlist, 
keeping only the songs I loved and wanted to play on repeat. If I was leaving music on in
the background, I would play the longer playlist. Other times, if I had my headphones on and was ready to 
really focus on the music, I would play the playlist with only my faves. 

This gave me an idea for a feature - what if you could just highlight certain songs in
your playlists, and have a separate shuffle mode for your highlighted songs? Most music players
already use the heart symbol for "liking" songs, so it would have to be a star instead. Hence _Star Players_!

I built a simple demo of the feature, with Astro, React, and Tailwind. It consists of a 
playlist of songs, along with the usual media player features. The star icon next to each
song title allows you to add them to your _Star Players_, and a separate shuffle mode in 
the media player allows you to initiate _StarPlay_.

You can check out the demo [here](https://conorfinlay.me/star-players).