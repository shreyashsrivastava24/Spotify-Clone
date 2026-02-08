console.log("Lets write js");

let currentSong = new Audio();
let songs;
let currentPlaylist = [];

function secondsToMinutesSeconds(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(remainingSeconds).padStart(2, "0");

  return `${formattedMinutes}:${formattedSeconds}`;
}

// Format song name - remove folder path, %5C, and .mp3 extension
function formatSongName(songPath) {
  // Decode %5C to backslash and remove folder prefix
  let cleanName = decodeURIComponent(songPath)
    .split("\\")
    .pop() // Get last part (filename)
    .replace(".mp3", "") // Remove .mp3 extension
    .replace(/%20/g, " "); // Replace %20 with spaces
  
  return cleanName;
}

// Get songs from a specific folder
async function getSongsFromFolder(folderPath) {
  try {
    let a = await fetch(`http://127.0.0.1:3000/songs/${folderPath}`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    let folderSongs = [];

    for (let index = 0; index < as.length; index++) {
      const element = as[index];
      if (element.href.endsWith(".mp3")) {
        folderSongs.push(element.href.split("%5Csongs%5C")[1]);
      }
    }
    return folderSongs;
  } catch (error) {
    console.error("Error fetching songs from folder:", error);
    return [];
  }
}

// hmari song directory se songs return krega
async function getSongs() {
  let a = await fetch("http://127.0.0.1:3000/songs/");
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");
  let songs = [];

  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split("%5Csongs%5C")[1]);
    }
  }
  return songs;
}

const playMusic = (track, pause = false) => {
  currentSong.src = "/songs/" + track;
  if (!pause) {
    currentSong.play();
    play.src = "pause.svg";
  }
  document.querySelector(".songinfo").innerHTML = formatSongName(track);
  document.querySelector(".songtime").innerHTML = "00:00/00:00";
};

// Function to load and display songs from a folder
async function loadPlaylist(folderPath, playlistName) {
  const playlistSongs = await getSongsFromFolder(folderPath);
  currentPlaylist = playlistSongs;
  
  let songUL = document
    .querySelector(".songList")
    .getElementsByTagName("ul")[0];
  
  songUL.innerHTML = `<li style="padding: 10px; border-bottom: 1px solid #444; font-weight: bold; color: #1DB954;">${playlistName}</li>`;

  for (const song of playlistSongs) {
    songUL.innerHTML += `
      <li>
        <img class="invert" src="music.svg" alt="">
        <div class="info">
          <div>${formatSongName(song)}</div>
        </div>
        <div class="playnow">
          <span>Play Now</span>
          <img class="invert" src="play1.svg" alt="">
        </div>
      </li>`;
  }

  Array.from(
    document.querySelector(".songList").getElementsByTagName("li"),
  ).forEach((e, index) => {
    if (index > 0) {
      e.addEventListener("click", () => {
        const songPath = Object.values(playlistSongs).find(
          s => formatSongName(s) === e.querySelector(".info").firstElementChild.innerHTML
        );
        if (songPath) playMusic(songPath);
      });
    }
  });
}

async function main() {
  songs = await getSongs();
  playMusic(songs[0], true);

  let songUL = document
    .querySelector(".songList")
    .getElementsByTagName("ul")[0];

  for (const song of songs) {
    songUL.innerHTML += `
      <li>
        <img class="invert" src="music.svg" alt="">
        <div class="info">
          <div>${formatSongName(song)}</div>
        </div>
        <div class="playnow">
          <span>Play Now</span>
          <img class="invert" src="play1.svg" alt="">
        </div>
      </li>`;
  }

  Array.from(
    document.querySelector(".songList").getElementsByTagName("li"),
  ).forEach((e) => {
    e.addEventListener("click", () => {
      const songPath = Object.values(songs).find(
        s => formatSongName(s) === e.querySelector(".info").firstElementChild.innerHTML
      );
      if (songPath) playMusic(songPath);
    });
  });

  // Add click event listeners to playlist cards
  Array.from(document.querySelectorAll(".card")).forEach((card) => {
    card.addEventListener("click", async () => {
      const folderPath = card.getAttribute("data-folder");
      const playlistName = card.querySelector("h2").innerHTML;
      loadPlaylist(folderPath, playlistName);
    });
  });

  // Attach an event listener to play, next and previous
  play.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      play.src = "pause.svg";
    } else {
      currentSong.pause();
      play.src = "play.svg";
    }
  });

  // Listen for timeupdate event
  currentSong.addEventListener("timeupdate", () => {
    document.querySelector(".songtime").innerHTML =
      `${secondsToMinutesSeconds(currentSong.currentTime)} / 
       ${secondsToMinutesSeconds(currentSong.duration)}`;

    document.querySelector(".circle").style.left =
      (currentSong.currentTime / currentSong.duration) * 100 + "%";
  });

  // Add an event listener to seekbar
  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentSong.currentTime = (currentSong.duration * percent) / 100;
  });

  // Add an event listener for hamburger
  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
  });

  // Add an event listener for close button
  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-120%";
  });

  // Add an event listener to previous
  previous.addEventListener("click", () => {
    currentSong.pause();
    let currentPlaylistToUse = currentPlaylist.length > 0 ? currentPlaylist : songs;
    let index = currentPlaylistToUse.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index - 1 >= 0) playMusic(currentPlaylistToUse[index - 1]);
  });

  // Add an event listener to next
  next.addEventListener("click", () => {
    currentSong.pause();
    let currentPlaylistToUse = currentPlaylist.length > 0 ? currentPlaylist : songs;
    let index = currentPlaylistToUse.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index + 1 < currentPlaylistToUse.length) playMusic(currentPlaylistToUse[index + 1]);
  });

  // Add an event to volume
  document
    .querySelector(".range")
    .getElementsByTagName("input")[0]
    .addEventListener("change", (e) => {
      console.log("Setting volume to", e.target.value, "/ 100");
      currentSong.volume = parseInt(e.target.value) / 100;
      if (currentSong.volume > 0) {
        document.querySelector(".volume>img").src = document
          .querySelector(".volume>img")
          .src.replace("mute.svg", "volume.svg");
      }
    });

  // Add event listener to mute the track
  document.querySelector(".volume>img").addEventListener("click", (e) => {
    if (e.target.src.includes("volume.svg")) {
      e.target.src = e.target.src.replace("volume.svg", "mute.svg");
      currentSong.volume = 0;
      document.querySelector(".range").getElementsByTagName("input")[0].value =
        0;
    } else {
      e.target.src = e.target.src.replace("mute.svg", "volume.svg");
      currentSong.volume = 0.1;
      document.querySelector(".range").getElementsByTagName("input")[0].value =
        10;
    }
  });

  // Theme toggle (Dark / Light)
  const themeBtn = document.getElementById("themeToggle");

  // Load saved theme
  if (localStorage.getItem("theme") === "light") {
    document.body.classList.add("light");
    themeBtn.innerHTML = "☀️";
  }

  themeBtn.addEventListener("click", () => {
    document.body.classList.toggle("light");

    if (document.body.classList.contains("light")) {
      themeBtn.innerHTML = "☀️";
      localStorage.setItem("theme", "light");
    } else {
      themeBtn.innerHTML = "🌙";
      localStorage.setItem("theme", "dark");
    }
  });
}

main();
