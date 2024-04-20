const musicContainer = document.getElementById('music-container');
const playBtn = document.getElementById('play');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');

const audio = document.getElementById('audio');
const progress = document.getElementById('progress');
const progressContainer = document.getElementById('progress-container');
const title = document.getElementById('title');
const cover = document.getElementById('cover');
const currTime = document.querySelector('#currTime');
const durTime = document.querySelector('#durTime');

// Song titles
const songTitles = {
	"AgainstAllOdds": "Against All Odds",
	"AlienQueen": "Alien Queen",
	"ANewBeginning": "A New Beginning",
	"BeTheOne": "Be The One",
	"Dreams": "Dreams",
	"Elevate": "Elevate",
	"GetToYou": "Get To You",
	"GoingHigher": "Going Higher",
	"Higher": "Higher",
	"ITry": "I Try",
	"Summer": "Summer",
	"Sunny": "Sunny",
	"ThereForYou": "There For You",
	"Ukelele": "Ukelele",
	"Waterfall": "Waterfall"
  };
const songs = Object.keys(songTitles);
let shuffledSongs = [];
let starPlayers = [];

let isShuffle = false;
let starPlay = false;
const starShuffleButton = document.getElementById('star-shuffle');
const starPlayButton = document.getElementById('star-play')
const shuffleBtn = document.getElementById('shuffle');


// Keep track of song
let songIndex = 0;

// Initially load song details into DOM
loadSong(songs[songIndex]);

const observer = new IntersectionObserver((entries) => {
	entries.forEach((entry) => {
		if (entry.isIntersecting) {
			entry.target.classList.add('show');
		} else {
			entry.target.classList.remove('show');
		}
	})
}, {
	// rootMargin: '-100px -100px 100px 100px'
})

const hiddenElements = document.querySelectorAll('.hidden');
hiddenElements.forEach((el) => observer.observe(el));

function renderSongList() {
	const songListContainer = document.getElementById('song-list');
	songListContainer.innerHTML = ''; // Clear existing list
  
	songs.forEach((song, index) => {
	  const songElement = document.createElement('div');
	  songElement.textContent = songTitles[song];
	  songElement.classList.add('song-item');
	  songElement.id = `song-${index}`;
	  songElement.innerHTML = `
	  <span class="song-title">${songTitles[song]}</span>
	  <i class="fas fa-star star-btn"></i>
	  `;

	  const starBtn = songElement.querySelector('.star-btn');
	  starBtn.addEventListener('click', (event) => {
		  event.stopPropagation(); // Prevent the click from triggering the song item's click event
		  toggleStar(index);
		  // Optionally, visually toggle the star's active state
		  starBtn.classList.toggle('starred', starPlayers.includes(songs[index]));
	  });
		
		
	  // Highlight the currently playing song
	  if (isShuffle && songs[index] == shuffledSongs[songIndex]) {
		songElement.classList.add('active');
	  } else if (starPlay && songs[index] == starPlayers[songIndex]){
		songElement.classList.add('active');
	  } else if (!isShuffle && !starPlay && index == songIndex){
		songElement.classList.add('active');
	  }

  
	  // Add click event to change to the clicked song
	  songElement.addEventListener('click', () => {
		if (isShuffle) toggleShuffle();
		if (starPlay) toggleStarPlay();
		songIndex = index;
		loadSong(songs[songIndex]);
		playSong();
	  });

	  songElement.addEventListener('mouseover', () => {
		songElement.classList.add('hovered');
	  });
	  
	  songElement.addEventListener('mouseout', () => {
		songElement.classList.remove('hovered');
	  });
  
	  songListContainer.appendChild(songElement);
	});
}

function updateStarPlayersUI() {
    // Loop through all star buttons and update their classes based on whether their song is in favorites
    document.querySelectorAll('.star-btn').forEach((btn, index) => {
        btn.classList.toggle('starred', starPlayers.includes(songs[index]));
    });
    // Plus, any additional UI updates for the favorites list itself
}


// Update song details
function loadSong(song) {
  title.innerText = songTitles[song];
  audio.src = `music/${song}.mp3`;
  cover.src = `images/${song}.jpg`;
  renderSongList();
  updateStarPlayersUI();
}

// Play song
function playSong() {
  musicContainer.classList.add('play');
  playBtn.querySelector('i.fas').classList.remove('fa-play');
  playBtn.querySelector('i.fas').classList.add('fa-pause');

  audio.play();
}

// Pause song
function pauseSong() {
  musicContainer.classList.remove('play');
  playBtn.querySelector('i.fas').classList.add('fa-play');
  playBtn.querySelector('i.fas').classList.remove('fa-pause');

  audio.pause();
}

function nextSong() {
	if (isShuffle) {
		if (songIndex == shuffledSongs.length - 1){
			shuffleArray(shuffledSongs);
			songIndex = 0;
		} else {
			songIndex = (songIndex + 1) % shuffledSongs.length; // Loop within the shuffledSongs
		}
		loadSong(shuffledSongs[songIndex]);
	} else if (starPlay){
		if (starPlayers.length == 0){
			toggleStarPlay();
			nextSong();
			return;
		}
		if (songIndex == starPlayers.length - 1){
			shuffleArray(starPlayers);
			songIndex = 0;
		} else {
			songIndex = (songIndex + 1) % starPlayers.length; // Loop within the shuffledSongs
		}
		loadSong(starPlayers[songIndex]);
		console.log(starPlayers.toString());
	} else {
		songIndex = (songIndex + 1) % songs.length; // Loop within the original songs array
		loadSong(songs[songIndex]);
	}
  	playSong();
  }
  
function prevSong() {
	if (isShuffle) {
		if (songIndex == 0){
			shuffleArray(shuffledSongs);
			songIndex = shuffledSongs.length - 1;
		} else {
			songIndex = (songIndex - 1) % shuffledSongs.length; // Loop within the shuffledSongs
		}
		loadSong(shuffledSongs[songIndex]);
	} else if (starPlay){
		if (starPlayers.length == 0) {
			toggleStarPlay();
			prevSong();
			return;
		}
		if (songIndex == 0){
			shuffleArray(starPlayers);
			songIndex = starPlayers.length - 1;
		} else {
			songIndex = (songIndex - 1) % starPlayers.length;
		}
		loadSong(starPlayers[songIndex]);
	} else {
		songIndex = (songIndex - 1) % songs.length; // Loop within the original songs array
		loadSong(songs[songIndex]);
	}
  	playSong();
}


// Update progress bar
function updateProgress(e) {
  const { duration, currentTime } = e.srcElement;
  const progressPercent = (currentTime / duration) * 100;
  progress.style.width = `${progressPercent}%`;
}

// Set progress bar
function setProgress(e) {
  const width = this.clientWidth;
  const clickX = e.offsetX;
  const duration = audio.duration;

  audio.currentTime = (clickX / width) * duration;
}

//get duration & currentTime for Time of song
function DurTime (e) {
	const {duration,currentTime} = e.srcElement;
	var sec;
	var sec_d;

	// define minutes currentTime
	let min = (currentTime==null)? 0:
	 Math.floor(currentTime/60);
	 min = min <10 ? '0'+min:min;

	// define seconds currentTime
	function get_sec (x) {
		if(Math.floor(x) >= 60){
			
			for (var i = 1; i<=60; i++){
				if(Math.floor(x)>=(60*i) && Math.floor(x)<(60*(i+1))) {
					sec = Math.floor(x) - (60*i);
					sec = sec <10 ? '0'+sec:sec;
				}
			}
		}else{
		 	sec = Math.floor(x);
		 	sec = sec <10 ? '0'+sec:sec;
		 }
	} 

	get_sec (currentTime,sec);

	// // change currentTime DOM
	// currTime.innerHTML = min +':'+ sec;

	// define minutes duration
	let min_d = (isNaN(duration) === true)? '0':
		Math.floor(duration/60);
	 min_d = min_d <10 ? '0'+min_d:min_d;


	 function get_sec_d (x) {
		if(Math.floor(x) >= 60){
			
			for (var i = 1; i<=60; i++){
				if(Math.floor(x)>=(60*i) && Math.floor(x)<(60*(i+1))) {
					sec_d = Math.floor(x) - (60*i);
					sec_d = sec_d <10 ? '0'+sec_d:sec_d;
				}
			}
		}else{
		 	sec_d = (isNaN(duration) === true)? '0':
		 	Math.floor(x);
		 	sec_d = sec_d <10 ? '0'+sec_d:sec_d;
		 }
	} 

	// define seconds duration
	
	get_sec_d (duration);

	// change duration DOM
	// durTime.innerHTML = min_d +':'+ sec_d;
		
};

// Event listeners
playBtn.addEventListener('click', () => {
  const isPlaying = musicContainer.classList.contains('play');

  if (isPlaying) {
    pauseSong();
  } else {
    playSong();
  }
});

function shuffleArray(array) {
	for (let i = array.length - 1; i > 0; i--) {
	  const j = Math.floor(Math.random() * (i + 1));
	  [array[i], array[j]] = [array[j], array[i]]; // Swap elements
	}
}
  
function toggleShuffle() {
	if (!isShuffle) { // Only toggle if isShuffle is currently false
		isShuffle = true; // Activate shuffle
		if (starPlay) { // If starPlay is active, deactivate it
			toggleStarPlay(); // This will set starPlay to false
		}
		shuffleBtn.classList.add('active');
		
		// Shuffle logic
		shuffledSongs = songs.slice();
		shuffleArray(shuffledSongs);
		songIndex = shuffledSongs.indexOf(songs[songIndex]);
	} else {
		isShuffle = false; // Deactivate shuffle
		shuffleBtn.classList.remove('active');
		// Revert to normal order if needed
		songIndex = songs.indexOf(shuffledSongs[songIndex]);
		shuffledSongs = [];
	}
}

function toggleStarPlay() {
    if (!starPlay) { // Only toggle if starPlay is currently false
		if (starPlayers.length == 0){
			alert('You need to choose some Star Players before activating StarPlay!');
			return;
		}
        starPlay = true; // Activate starPlay
        if (isShuffle) { // If isShuffle is active, deactivate it
            toggleShuffle(); // This will set isShuffle to false
        }
        starPlayButton.classList.add('active');
		starShuffleButton.classList.add('active');
        // StarPlay-specific logic here
		songIndex = shuffledSongs.length - 1;
		// shuffleArray(starPlayers);
		// loadSong(starPlayers[songIndex]);
		// playSong();
    } else {
        starPlay = false; // Deactivate starPlay
        starPlayButton.classList.remove('active');
		starShuffleButton.classList.remove('active');
        // Additional logic to revert any changes made by starPlay if needed
		songIndex = songs.indexOf(starPlayers[songIndex]);
    }
}

function toggleStar(songIndex) {
    const songName = songs[songIndex];
    const isStarPlayer = starPlayers.includes(songName);
    if (isStarPlayer) {
        // Remove from favorites
        starPlayers = starPlayers.filter(starPlayer => starPlayer !== songName);
    } else {
        // Add to favorites
        starPlayers.push(songName);
    }
    // Optionally, update the UI to reflect the change
    updateStarPlayersUI();
}

  
document.getElementById('starplay').addEventListener('click', toggleStarPlay);
shuffleBtn.addEventListener('click', toggleShuffle);

// Change song
prevBtn.addEventListener('click', prevSong);
nextBtn.addEventListener('click', nextSong);

// Time/song update
audio.addEventListener('timeupdate', updateProgress);

// Click on progress bar
progressContainer.addEventListener('click', setProgress);

// Song ends
audio.addEventListener('ended', nextSong);

// Time of song
audio.addEventListener('timeupdate',DurTime);
