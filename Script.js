console.log("Spotify Clone Loaded");

/* =========================================================
   GLOBAL VARIABLES
   ========================================================= */

let currentSong = new Audio();
let songs = [];
let currFolder = "";
let currentTrackIndex = -1;


/* =========================================================
   DOM ELEMENTS
   ========================================================= */

const playButton = document.querySelector("#play");
const previousButton = document.querySelector("#previous");
const nextButton = document.querySelector("#next");

const songInfo = document.querySelector(".songinfo");
const songTime = document.querySelector(".songtime");

const seekContainer = document.querySelector(".seek-container");
const seekbar = document.querySelector(".seekbar");
const circle = document.querySelector(".circle");

const volumeInput = document.querySelector("#voulme input");

const minus5Button = document.querySelector("#minus5sec");
const plus5Button = document.querySelector("#plus5sec");

const songList = document.querySelector(".songlist ul");
const cardContainer = document.querySelector(".cards");


/* =========================================================
   SONG DATA
   ========================================================= */

async function getsongs(folder) {

    currFolder = folder;

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

    songs = songLists[folder] || [];

    console.log("Current folder:", currFolder);
    console.log("Songs:", songs);

    return songs;
}


/* =========================================================
   FORMAT TIME
   ========================================================= */

function formatTime(seconds) {

    if (!Number.isFinite(seconds) || seconds < 0) {
        return "00:00";
    }

    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);

    const formattedMins = String(mins).padStart(2, "0");
    const formattedSecs = String(secs).padStart(2, "0");

    return `${formattedMins}:${formattedSecs}`;
}


/* =========================================================
   CLEAN SONG NAME
   ========================================================= */

function cleanSongName(song) {

    return decodeURIComponent(
        song
            .replaceAll("%20", " ")
            .replaceAll("%5C", "")
    );
}


/* =========================================================
   PLAY MUSIC
   ========================================================= */

function playMusic(track, pause = false) {

    if (!track) {
        return;
    }

    const cleanTrack = cleanSongName(track);

    currentTrackIndex = songs.findIndex(
        song => cleanSongName(song) === cleanTrack
    );

    if (currentTrackIndex === -1) {
        currentTrackIndex = songs.findIndex(
            song => song === track
        );
    }

    currentSong.src =
        `/${currFolder}/${encodeURIComponent(cleanTrack)}`;

    currentSong.load();

    if (!pause) {

        currentSong
            .play()
            .then(() => {

                if (playButton) {
                    const img = playButton.querySelector("img");

                    if (img) {
                        img.src = "pause.svg";
                    }
                }

            })
            .catch(error => {
                console.error("Audio play error:", error);
            });

    } else {

        if (playButton) {
            const img = playButton.querySelector("img");

            if (img) {
                img.src = "play.svg";
            }
        }
    }

    if (songInfo) {
        songInfo.innerHTML = cleanTrack;
    }

    if (songTime) {
        songTime.innerHTML = "00:00 / 00:00";
    }

    updateSeekbar(0);
}


/* =========================================================
   PLAY / PAUSE BUTTON
   ========================================================= */

if (playButton) {

    playButton.addEventListener("click", () => {

        if (!currentSong.src) {
            return;
        }

        if (currentSong.paused) {

            currentSong
                .play()
                .then(() => {

                    const img =
                        playButton.querySelector("img");

                    if (img) {
                        img.src = "pause.svg";
                    }

                })
                .catch(error => {
                    console.error(
                        "Unable to play audio:",
                        error
                    );
                });

        } else {

            currentSong.pause();

            const img =
                playButton.querySelector("img");

            if (img) {
                img.src = "play.svg";
            }
        }

    });

}


/* =========================================================
   AUDIO TIME UPDATE
   ========================================================= */

currentSong.addEventListener("timeupdate", () => {

    if (!Number.isFinite(currentSong.duration)) {
        return;
    }

    const current = currentSong.currentTime;
    const duration = currentSong.duration;

    if (songTime) {

        songTime.innerHTML =
            `${formatTime(current)} / ${formatTime(duration)}`;

    }

    const percentage =
        duration > 0
            ? (current / duration) * 100
            : 0;

    updateSeekbar(percentage);

});


/* =========================================================
   AUDIO METADATA LOADED
   ========================================================= */

currentSong.addEventListener("loadedmetadata", () => {

    if (songTime) {

        songTime.innerHTML =
            `${formatTime(currentSong.currentTime)} / ${formatTime(currentSong.duration)}`;

    }

    updateSeekbar(
        currentSong.duration > 0
            ? (currentSong.currentTime / currentSong.duration) * 100
            : 0
    );

});


/* =========================================================
   AUDIO ENDED
   ========================================================= */

currentSong.addEventListener("ended", () => {

    if (playButton) {

        const img =
            playButton.querySelector("img");

        if (img) {
            img.src = "play.svg";
        }
    }

    /*
       Automatically play next song
    */

    if (
        currentTrackIndex >= 0 &&
        currentTrackIndex + 1 < songs.length
    ) {

        playMusic(
            songs[currentTrackIndex + 1]
        );

    } else {

        updateSeekbar(0);
    }

});


/* =========================================================
   SEEK BAR UPDATE
   ========================================================= */

function updateSeekbar(percent) {

    if (!seekbar || !circle) {
        return;
    }

    const safePercent =
        Math.max(
            0,
            Math.min(
                100,
                Number(percent) || 0
            )
        );

    /*
       CSS uses this variable to create
       the green progress section.
    */

    seekbar.style.setProperty(
        "--progress",
        `${safePercent}%`
    );

    /*
       Move the circle horizontally.
    */

    circle.style.left =
        `${safePercent}%`;

}


/* =========================================================
   SEEK BAR CLICK
   ========================================================= */

if (seekContainer && seekbar) {

    seekContainer.addEventListener(
        "click",
        (event) => {

            if (
                !currentSong.duration ||
                !Number.isFinite(currentSong.duration)
            ) {
                return;
            }

            /*
               Get the actual horizontal
               position of the click.
            */

            const rect =
                seekbar.getBoundingClientRect();

            const clickX =
                event.clientX - rect.left;

            /*
               Convert click position
               into percentage.
            */

            let percent =
                (clickX / rect.width) * 100;

            percent =
                Math.max(
                    0,
                    Math.min(100, percent)
                );

            /*
               Change audio position.
            */

            currentSong.currentTime =
                (currentSong.duration * percent) / 100;

            /*
               Immediately update UI.
            */

            updateSeekbar(percent);

        }
    );

}


/* =========================================================
   SEEK BAR DRAGGING
   ========================================================= */

let isSeeking = false;


/*
   Start dragging
*/

if (seekContainer) {

    seekContainer.addEventListener(
        "mousedown",
        (event) => {

            if (
                !currentSong.duration ||
                !Number.isFinite(currentSong.duration)
            ) {
                return;
            }

            isSeeking = true;

            seekToMousePosition(event);

        }
    );

}


/*
   Continue dragging
*/

document.addEventListener(
    "mousemove",
    (event) => {

        if (!isSeeking) {
            return;
        }

        seekToMousePosition(event);

    }
);


/*
   Stop dragging
*/

document.addEventListener(
    "mouseup",
    () => {

        isSeeking = false;

    }
);


/* =========================================================
   SEEK TO MOUSE POSITION
   ========================================================= */

function seekToMousePosition(event) {

    if (
        !seekbar ||
        !currentSong.duration ||
        !Number.isFinite(currentSong.duration)
    ) {
        return;
    }

    const rect =
        seekbar.getBoundingClientRect();

    let percent =
        ((event.clientX - rect.left) / rect.width) * 100;

    percent =
        Math.max(
            0,
            Math.min(100, percent)
        );

    currentSong.currentTime =
        (currentSong.duration * percent) / 100;

    updateSeekbar(percent);

}


/* =========================================================
   MINUS 5 SECONDS
   ========================================================= */

if (minus5Button) {

    minus5Button.addEventListener(
        "click",
        () => {

            if (!currentSong.duration) {
                return;
            }

            currentSong.currentTime =
                Math.max(
                    0,
                    currentSong.currentTime - 5
                );

        }
    );

}


/* =========================================================
   PLUS 5 SECONDS
   ========================================================= */

if (plus5Button) {

    plus5Button.addEventListener(
        "click",
        () => {

            if (!currentSong.duration) {
                return;
            }

            currentSong.currentTime =
                Math.min(
                    currentSong.duration,
                    currentSong.currentTime + 5
                );

        }
    );

}


/* =========================================================
   PREVIOUS SONG
   ========================================================= */

if (previousButton) {

    previousButton.addEventListener(
        "click",
        () => {

            if (!songs.length) {
                return;
            }

            /*
               If the song has played for more than
               3 seconds, previous should restart it.
            */

            if (currentSong.currentTime > 3) {

                currentSong.currentTime = 0;

                return;
            }

            if (currentTrackIndex > 0) {

                playMusic(
                    songs[currentTrackIndex - 1]
                );

            }

        }
    );

}


/* =========================================================
   NEXT SONG
   ========================================================= */

if (nextButton) {

    nextButton.addEventListener(
        "click",
        () => {

            if (!songs.length) {
                return;
            }

            if (
                currentTrackIndex >= 0 &&
                currentTrackIndex + 1 < songs.length
            ) {

                playMusic(
                    songs[currentTrackIndex + 1]
                );

            }

        }
    );

}


/* =========================================================
   VOLUME
   ========================================================= */

if (volumeInput) {

    currentSong.volume =
        Number(volumeInput.value) / 100;

    volumeInput.addEventListener(
        "input",
        (event) => {

            const volume =
                Number(event.target.value) / 100;

            currentSong.volume = volume;

        }
    );

}


/* =========================================================
   DISPLAY SONG LIST
   ========================================================= */

function displaySongs() {

    if (!songList) {
        return;
    }

    songList.innerHTML = "";

    for (const song of songs) {

        const cleanName =
            cleanSongName(song);

        songList.innerHTML += `

            <li>

                <img
                    class="invert"
                    src="music.svg"
                    alt=""
                >

                <div class="info">

                    <div>
                        ${cleanName}
                    </div>

                </div>

                <div class="playnow">

                    <span>
                        play Now
                    </span>

                    <img
                        class="invert"
                        src="play.svg"
                        alt=""
                    >

                </div>

            </li>

        `;
    }


    /*
       Add click events to songs
    */

    const songElements =
        songList.querySelectorAll("li");


    songElements.forEach(
        (songElement, index) => {

            songElement.addEventListener(
                "click",
                () => {

                    playMusic(
                        songs[index]
                    );

                }
            );

        }
    );

}


/* =========================================================
   DISPLAY ALBUMS
   ========================================================= */

function displayAlbums() {

    if (!cardContainer) {
        return;
    }

    const albums = [

        {
            folder: "cs",

            title: "Chill & Soul",

            description:
                "A collection of relaxing and soulful tracks.",

            className: ""
        },

        {
            folder: "ncs",

            title: "NCS",

            description:
                "Energetic tracks for every moment.",

            className: "blue"
        }

    ];


    cardContainer.innerHTML = "";


    albums.forEach(album => {

        cardContainer.innerHTML += `

            <div
                data-folder="${album.folder}"
                class="album-card"
            >

                <div class="album-image">

                    <img
                        src="/songs/${album.folder}/cover.jpeg"
                        alt="${album.title}"
                    >

                    <div class="image-overlay"></div>

                    <div class="album-play">

                        <img
                            src="play.svg"
                            class="invert"
                            alt="Play"
                        >

                    </div>

                </div>


                <div class="album-content">

                    <div class="album-tag ${album.className}">
                        ${album.folder === "cs" ? "CHILL" : "ENERGY"}
                    </div>

                    <h2>
                        ${album.title}
                    </h2>

                    <h4>
                        ${album.description}
                    </h4>

                </div>

            </div>

        `;

    });


    /*
       Add album click events
    */

    const albumCards =
        cardContainer.querySelectorAll(".album-card");


    albumCards.forEach(card => {

        card.addEventListener(
            "click",
            async () => {

                const folder =
                    card.dataset.folder;

                console.log(
                    "Album clicked:",
                    folder
                );


                songs =
                    await getsongs(
                        `songs/${folder}`
                    );


                displaySongs();


                /*
                   Load first song without
                   automatically playing it.
                */

                if (songs.length > 0) {

                    currentTrackIndex = 0;

                    playMusic(
                        songs[0],
                        true
                    );

                }

            }
        );

    });

}


/* =========================================================
   INITIAL SONG LIST
   ========================================================= */

async function loadInitialSongs() {

    await getsongs("songs/cs");

    displaySongs();

    /*
       Load first song but don't play automatically.
    */

    if (songs.length > 0) {

        currentTrackIndex = 0;

        playMusic(
            songs[0],
            true
        );

    }

}


/* =========================================================
   MAIN
   ========================================================= */

async function main() {

    console.log("Starting Spotify Clone...");

    /*
       Display album cards
    */

    displayAlbums();


    /*
       Load Chill & Soul songs
       into the left library.
    */

    await loadInitialSongs();


    /*
       Set initial volume
    */

    if (volumeInput) {

        currentSong.volume =
            Number(volumeInput.value) / 100;

    }


    console.log("Spotify Clone Ready");

}


/* =========================================================
   START APP
   ========================================================= */

main();
