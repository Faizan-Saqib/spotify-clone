console.log("Spotify Clone Started");

let crruntsong = new Audio();

let songs = [];
let currFolder = "";
let currentSongIndex = -1;


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

    currentSongIndex = -1;

    return songs;
}


/* =========================================================
   ELEMENTS
========================================================= */

const playButton = document.querySelector("#play");
const previousButton = document.querySelector("#previous");
const nextButton = document.querySelector("#next");

const seekbar = document.querySelector(".seekbar");
const circle = document.querySelector(".circle");

const songInfo = document.querySelector(".songinfo");
const songTime = document.querySelector(".songtime");

const volumeInput = document.querySelector("#voulme input");

const disc = document.querySelector("#disc");


/* =========================================================
   FORMAT TIME
========================================================= */

function formatTime(seconds) {

    if (!Number.isFinite(seconds)) {
        return "00:00";
    }

    const mins = Math.floor(seconds / 60);

    const secs = Math.floor(seconds % 60);

    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}


/* =========================================================
   UPDATE SEEK BAR
========================================================= */

function updateSeekBar() {

    if (
        !Number.isFinite(crruntsong.duration) ||
        crruntsong.duration <= 0
    ) {
        seekbar.style.setProperty("--progress", "0%");
        return;
    }

    const percent =
        (crruntsong.currentTime / crruntsong.duration) * 100;

    const safePercent =
        Math.min(100, Math.max(0, percent));

    seekbar.style.setProperty(
        "--progress",
        `${safePercent}%`
    );
}


/* =========================================================
   PLAY MUSIC
========================================================= */

function playMusic(track, pause = false) {

    if (!track) {
        return;
    }

    const index = songs.indexOf(track);

    if (index !== -1) {
        currentSongIndex = index;
    }

    crruntsong.src =
        `/${currFolder}/${encodeURIComponent(track)}`;

    songInfo.innerHTML = track;

    songTime.innerHTML = "00:00 / 00:00";

    updateSeekBar();

    if (!pause) {

        crruntsong
            .play()
            .then(() => {

                playButton.querySelector("img").src =
                    "pause.svg";

                disc.classList.add("rotate");

            })
            .catch(error => {

                console.error(
                    "Audio playback error:",
                    error
                );

            });

    } else {

        playButton.querySelector("img").src =
            "play.svg";

        disc.classList.remove("rotate");
    }
}


/* =========================================================
   DISPLAY SONGS
========================================================= */

function displaySongs() {

    const songul =
        document.querySelector(".songlist ul");

    songul.innerHTML = "";

    songs.forEach((song, index) => {

        songul.innerHTML += `

            <li data-index="${index}">

                <img
                    class="invert"
                    src="music.svg"
                    alt=""
                >

                <div class="info">

                    <div>
                        ${song}
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

    });


    const songElements =
        songul.querySelectorAll("li");


    songElements.forEach(songElement => {

        songElement.addEventListener(
            "click",
            () => {

                const index =
                    Number(songElement.dataset.index);

                currentSongIndex = index;

                playMusic(
                    songs[index]
                );

            }
        );

    });

}


/* =========================================================
   DISPLAY ALBUMS
========================================================= */

function displayAlbums() {

    const cardcontainer =
        document.querySelector(".cards");

    cardcontainer.innerHTML = `

        <div
            data-folder="cs"
            class="album-card"
        >

            <div class="album-content">

                <div class="album-tag">
                    CHILL
                </div>

                <h2>
                    Chill & Soul
                </h2>

                <h4>
                    A collection of relaxing and soulful tracks.
                </h4>

            </div>

        </div>


        <div
            data-folder="ncs"
            class="album-card"
        >

            <div class="album-content">

                <div class="album-tag blue">
                    ENERGY
                </div>

                <h2>
                    NCS
                </h2>

                <h4>
                    Energetic tracks for every moment.
                </h4>

            </div>

        </div>

    `;


    const albumCards =
        document.querySelectorAll(".album-card");


    albumCards.forEach(card => {

        card.addEventListener(
            "click",
            async () => {

                const folder =
                    `songs/${card.dataset.folder}`;

                songs =
                    await getsongs(folder);

                displaySongs();

                if (songs.length > 0) {

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
   PLAY / PAUSE
========================================================= */

playButton.addEventListener(
    "click",
    () => {

        if (!crruntsong.src) {

            if (songs.length > 0) {

                currentSongIndex = 0;

                playMusic(
                    songs[0]
                );

            }

            return;
        }


        if (crruntsong.paused) {

            crruntsong
                .play()
                .then(() => {

                    playButton.querySelector("img").src =
                        "pause.svg";

                    disc.classList.add("rotate");

                });

        } else {

            crruntsong.pause();

            playButton.querySelector("img").src =
                "play.svg";

            disc.classList.remove("rotate");
        }

    }
);


/* =========================================================
   TIME UPDATE
========================================================= */

crruntsong.addEventListener(
    "timeupdate",
    () => {

        songTime.innerHTML =
            `${formatTime(crruntsong.currentTime)} / ${formatTime(crruntsong.duration)}`;

        updateSeekBar();

    }
);


/* =========================================================
   METADATA LOADED
========================================================= */

crruntsong.addEventListener(
    "loadedmetadata",
    () => {

        songTime.innerHTML =
            `${formatTime(crruntsong.currentTime)} / ${formatTime(crruntsong.duration)}`;

        updateSeekBar();

    }
);


/* =========================================================
   SONG ENDED
========================================================= */

crruntsong.addEventListener(
    "ended",
    () => {

        if (
            currentSongIndex >= 0 &&
            currentSongIndex < songs.length - 1
        ) {

            currentSongIndex++;

            playMusic(
                songs[currentSongIndex]
            );

        } else {

            playButton.querySelector("img").src =
                "play.svg";

            disc.classList.remove("rotate");

            updateSeekBar();
        }

    }
);


/* =========================================================
   SEEK BAR
   FIXED: HORIZONTAL X POSITION
========================================================= */

seekbar.addEventListener(
    "click",
    (event) => {

        if (
            !Number.isFinite(crruntsong.duration) ||
            crruntsong.duration <= 0
        ) {
            return;
        }


        const rect =
            seekbar.getBoundingClientRect();


        const clickX =
            event.clientX - rect.left;


        let percent =
            clickX / rect.width;


        percent =
            Math.min(
                1,
                Math.max(0, percent)
            );


        crruntsong.currentTime =
            crruntsong.duration * percent;


        updateSeekBar();

    }
);


/* =========================================================
   SEEK BAR DRAGGING
========================================================= */

let isDragging = false;


seekbar.addEventListener(
    "pointerdown",
    (event) => {

        if (
            !Number.isFinite(crruntsong.duration) ||
            crruntsong.duration <= 0
        ) {
            return;
        }

        isDragging = true;

        seekbar.setPointerCapture(
            event.pointerId
        );

        seekToPosition(event);

    }
);


seekbar.addEventListener(
    "pointermove",
    (event) => {

        if (!isDragging) {
            return;
        }

        seekToPosition(event);

    }
);


seekbar.addEventListener(
    "pointerup",
    () => {

        isDragging = false;

    }
);


seekbar.addEventListener(
    "pointercancel",
    () => {

        isDragging = false;

    }
);


function seekToPosition(event) {

    const rect =
        seekbar.getBoundingClientRect();


    const position =
        event.clientX - rect.left;


    let percent =
        position / rect.width;


    percent =
        Math.min(
            1,
            Math.max(0, percent)
        );


    crruntsong.currentTime =
        crruntsong.duration * percent;


    updateSeekBar();

}


/* =========================================================
   -5 SECONDS
========================================================= */

document
    .querySelector("#minus5sec")
    .addEventListener(
        "click",
        (event) => {

            event.stopPropagation();

            if (
                !Number.isFinite(crruntsong.duration)
            ) {
                return;
            }

            crruntsong.currentTime =
                Math.max(
                    0,
                    crruntsong.currentTime - 5
                );

        }
    );


/* =========================================================
   +5 SECONDS
========================================================= */

document
    .querySelector("#plus5sec")
    .addEventListener(
        "click",
        (event) => {

            event.stopPropagation();

            if (
                !Number.isFinite(crruntsong.duration)
            ) {
                return;
            }

            crruntsong.currentTime =
                Math.min(
                    crruntsong.duration,
                    crruntsong.currentTime + 5
                );

        }
    );


/* =========================================================
   PREVIOUS
========================================================= */

previousButton.addEventListener(
    "click",
    () => {

        if (!songs.length) {
            return;
        }

        if (currentSongIndex > 0) {

            currentSongIndex--;

            playMusic(
                songs[currentSongIndex]
            );

        }

    }
);


/* =========================================================
   NEXT
========================================================= */

nextButton.addEventListener(
    "click",
    () => {

        if (!songs.length) {
            return;
        }

        if (
            currentSongIndex <
            songs.length - 1
        ) {

            currentSongIndex++;

            playMusic(
                songs[currentSongIndex]
            );

        }

    }
);


/* =========================================================
   VOLUME
========================================================= */

volumeInput.addEventListener(
    "input",
    (event) => {

        crruntsong.volume =
            Number(event.target.value) / 100;

    }
);


/* =========================================================
   INITIALIZATION
========================================================= */

async function main() {

    songs =
        await getsongs("songs/cs");

    displayAlbums();

    displaySongs();

    if (songs.length > 0) {

        playMusic(
            songs[0],
            true
        );

    }

}


/* =========================================================
   START
========================================================= */

main();
