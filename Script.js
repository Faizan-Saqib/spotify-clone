let currentSong = new Audio();
let songs = [];
let currFolder = "";
let currentIndex = -1;

const songLists = {
    "songs/cs": [
        "Enlivening.mp3",
        "Final Scene.mp3",
        "Mawla Ya Salli Wa Sallim.mp3",
        "Naat.mp3",
        "Tajdar-e-Haram.mp3",
        "Voyage.mp3",
        "Wings of Freedom.mp3"
    ],
    "songs/ncs": [
        "Crazy Frog.mp3"
    ]
};

async function getsongs(folder) {
    currFolder = folder;
    songs = songLists[folder] || [];
    return songs;
}

function formatTime(seconds) {
    if (!Number.isFinite(seconds)) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return String(mins).padStart(2, "0") + ":" + String(secs).padStart(2, "0");
}

function cleanSongName(song) {
    if (!song) return "";
    return decodeURIComponent(song.replaceAll("%20", " ").replaceAll("%5C", ""));
}

function playMusic(track, pause = false) {
    const index = songs.indexOf(track);
    if (index !== -1) currentIndex = index;

    currentSong.src = `/${currFolder}/${encodeURIComponent(track)}`;
    const songInfo = document.querySelector(".songinfo");
    const songTime = document.querySelector(".songtime");
    
    if (songInfo) songInfo.innerHTML = cleanSongName(track);
    if (songTime) songTime.innerHTML = "00:00 / 00:00";
    
    updateSeekbar(0);

    if (!pause) {
        currentSong.play().then(() => {
            document.querySelector("#play img").src = "pause.svg";
            document.querySelector("#disc").classList.add("rotate");
        }).catch(err => console.error("Playback error:", err));
    } else {
        document.querySelector("#play img").src = "play.svg";
        document.querySelector("#disc").classList.remove("rotate");
    }
}

function updateSeekbar(percent) {
    const circle = document.querySelector(".circle");
    const seekbar = document.querySelector(".seekbar");
    if (!circle || !seekbar) return;

    percent = Math.max(0, Math.min(100, percent));
    circle.style.left = `${percent}%`;
    seekbar.style.background = `linear-gradient(to right, var(--green) 0%, var(--green) ${percent}%, #333 ${percent}%, #333 100%)`;
}

function displayAlbums() {
    const cardcontainer = document.querySelector(".cards");
    if (!cardcontainer) return;

    const albums = [
        { folder: "cs", title: "Chill & Soul", subtitle: "Chill & Soul", desc: "A collection of relaxing and soulful tracks." },
        { folder: "ncs", title: "NCS", subtitle: "NCS", desc: "Energetic tracks for every moment." }
    ];

    cardcontainer.innerHTML = "";
    albums.forEach(album => {
        cardcontainer.innerHTML += `
            <div data-folder="${album.folder}" class="album-card">
                <h2>${album.title}</h2>
                <h2 style="font-size: 18px; margin-bottom: 8px;">${album.subtitle}</h2>
                <h4>${album.desc}</h4>
            </div>
        `;
    });

    document.querySelectorAll(".album-card").forEach(card => {
        card.addEventListener("click", async () => {
            await loadAlbum(`songs/${card.dataset.folder}`);
        });
    });
}

async function loadAlbum(folder) {
    await getsongs(folder);
    const songul = document.querySelector(".songlist ul");
    if (!songul) return;
    
    songul.innerHTML = "";
    songs.forEach((song, index) => {
        songul.innerHTML += `
            <li data-index="${index}">
                <div class="song-left">
                    <img class="invert" src="music.svg" alt="icon">
                    <div class="info">${cleanSongName(song)}</div>
                </div>
                <div class="playnow">
                    <span>play Now</span>
                    <img class="invert" src="play.svg" alt="play">
                </div>
            </li>
        `;
    });

    songul.querySelectorAll("li").forEach((li, index) => {
        li.addEventListener("click", () => {
            currentIndex = index;
            playMusic(songs[index]);
        });
    });

    if (songs.length > 0) {
        currentIndex = 0;
        playMusic(songs[0], true);
    }
}

function togglePlay() {
    if (!currentSong.src) return;
    const playImg = document.querySelector("#play img");
    const disc = document.querySelector("#disc");

    if (currentSong.paused) {
        currentSong.play().then(() => {
            playImg.src = "pause.svg";
            disc.classList.add("rotate");
        });
    } else {
        currentSong.pause();
        playImg.src = "play.svg";
        disc.classList.remove("rotate");
    }
}

function setupSeekbar() {
    const seekbar = document.querySelector(".seekbar");
    if (!seekbar) return;

    seekbar.addEventListener("click", e => {
        if (!Number.isFinite(currentSong.duration)) return;
        const rect = seekbar.getBoundingClientRect();
        let percent = (e.clientX - rect.left) / rect.width;
        percent = Math.max(0, Math.min(1, percent));
        currentSong.currentTime = currentSong.duration * percent;
        updateSeekbar(percent * 100);
    });
}

function setupSkipButtons() {
    document.querySelector("#minus5sec")?.addEventListener("click", e => {
        e.stopPropagation();
        currentSong.currentTime = Math.max(0, currentSong.currentTime - 5);
    });
    document.querySelector("#plus5sec")?.addEventListener("click", e => {
        e.stopPropagation();
        if (Number.isFinite(currentSong.duration)) {
            currentSong.currentTime = Math.min(currentSong.duration, currentSong.currentTime + 5);
        }
    });
}

function setupAudioEvents() {
    currentSong.addEventListener("loadedmetadata", () => {
        document.querySelector(".songtime").innerHTML = `00:00 / ${formatTime(currentSong.duration)}`;
        updateSeekbar(0);
    });

    currentSong.addEventListener("timeupdate", () => {
        if (!Number.isFinite(currentSong.duration)) return;
        const current = formatTime(currentSong.currentTime);
        const duration = formatTime(currentSong.duration);
        document.querySelector(".songtime").innerHTML = `${current} / ${duration}`;
        updateSeekbar((currentSong.currentTime / currentSong.duration) * 100);
    });

    currentSong.addEventListener("play", () => {
        document.querySelector("#play img").src = "pause.svg";
        document.querySelector("#disc").classList.add("rotate");
    });

    currentSong.addEventListener("pause", () => {
        document.querySelector("#play img").src = "play.svg";
        document.querySelector("#disc").classList.remove("rotate");
    });
}

function setupVolume() {
    const volInput = document.querySelector("#volume input");
    if (!volInput) return;

    // Set initial background fill (assuming starts at 100%)
    volInput.style.background = `linear-gradient(to right, var(--green) 100%, #333 100%)`;

    volInput.addEventListener("input", e => {
        const percent = e.target.value;
        currentSong.volume = percent / 100;
        
        // Dynamically fill the bar matching the exact volume level
        volInput.style.background = `linear-gradient(to right, var(--green) ${percent}%, #333 ${percent}%)`;
    });
}

async function main() {
    displayAlbums();
    await loadAlbum("songs/cs");

    document.querySelector("#play")?.addEventListener("click", togglePlay);
    document.querySelector("#previous")?.addEventListener("click", () => {
        if (currentIndex > 0) { currentIndex--; playMusic(songs[currentIndex]); }
    });
    document.querySelector("#next")?.addEventListener("click", () => {
        if (currentIndex + 1 < songs.length) { currentIndex++; playMusic(songs[currentIndex]); }
    });

    setupSeekbar();
    setupSkipButtons();
    setupAudioEvents();
    setupVolume();
}

// CRITICAL FIX: This guarantees the HTML exists before JS tries to touch it.
document.addEventListener("DOMContentLoaded", () => {
    main().catch(err => console.error("Initialization Error:", err));
});
