console.log("Spotify Clone Loaded");

let crruntsong = new Audio();

let songs = [];
let currFolder = "";
let currentIndex = -1;


/* =========================================================
   SONG DATABASE
========================================================= */

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


/* =========================================================
   GET SONGS
========================================================= */

async function getsongs(folder) {

    currFolder = folder;

    songs = songLists[folder] || [];

    console.log("Current folder:", currFolder);
    console.log("Songs:", songs);

    return songs;
}


/* =========================================================
   FORMAT TIME
========================================================= */

function formatTime(seconds) {

    if (!Number.isFinite(seconds)) {
        return "00:00";
    }

    const mins = Math.floor(seconds / 60);

    const secs = Math.floor(seconds % 60);

    return (
        String(mins).padStart(2, "0") +
        ":" +
        String(secs).padStart(2, "0")
    );
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

    const index = songs.indexOf(track);

    if (index !== -1) {
        currentIndex = index;
    }

    crruntsong.src =
        `/${currFolder}/${encodeURIComponent(track)}`;

    document.querySelector(".songinfo").innerHTML =
        cleanSongName(track);

    document.querySelector(".songtime").innerHTML =
        "00:00 / 00:00";

    updateSeekbar(0);

    if (!pause) {

        crruntsong
            .play()
            .then(() => {

                document.querySelector("#play img").src =
                    "pause.svg";

                document
                    .querySelector("#disc")
                    .classList.add("rotate");

            })
            .catch(error => {

                console.error(
                    "Audio playback error:",
                    error
                );

            });
    }
    else {

        document.querySelector("#play img").src =
            "play.svg";

        document
            .querySelector("#disc")
            .classList.remove("rotate");
    }
}


/* =========================================================
   UPDATE SEEK BAR
========================================================= */

function updateSeekbar(percent) {

    const circle =
        document.querySelector(".circle");

    const seekbar =
        document.querySelector(".seekbar");

    if (!circle || !seekbar) return;

    percent = Math.max(
        0,
        Math.min(100, percent)
    );

    circle.style.left = `${percent}%`;

    seekbar.style.setProperty(
        "--progress",
        `${percent}%`
    );

    seekbar.style.setProperty(
        "background",
        `linear-gradient(
            to right,
            #00e5a0 0%,
            #00e5a0 ${percent}%,
            #575b5b ${percent}%,
            #575b5b 100%
        )`
    );
}


/* =========================================================
   DISPLAY ALBUMS
========================================================= */

function displayAlbums() {

    const cardcontainer =
        document.querySelector(".cards");

    if (!cardcontainer) return;

    const albums = [
        {
            folder: "cs",
            title: "Chill & Soul",
            description:
                "A collection of relaxing and soulful tracks."
        },

        {
            folder: "ncs",
            title: "NCS",
            description:
                "Energetic tracks for every moment."
        }
    ];

    cardcontainer.innerHTML = "";

    albums.forEach(album => {

        cardcontainer.innerHTML += `
            <div
                data-folder="${album.folder}"
                class="album-card"
            >

                <div class="album-content">

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

    document
        .querySelectorAll(".album-card")
        .forEach(card => {

            card.addEventListener(
                "click",
                async () => {

                    const folder =
                        `songs/${card.dataset.folder}`;

                    await loadAlbum(folder);
                }
            );
        });
}


/* =========================================================
   LOAD ALBUM
========================================================= */

async function loadAlbum(folder) {

    await getsongs(folder);

    const songul =
        document.querySelector(".songlist ul");

    if (!songul) return;

    songul.innerHTML = "";

    songs.forEach(song => {

        songul.innerHTML += `
            <li data-song="${encodeURIComponent(song)}">

                <img
                    class="invert"
                    src="music.svg"
                    alt=""
                >

                <div class="info">

                    <div>
                        ${cleanSongName(song)}
                    </div>

                </div>

                <div class="playnow">

                    <span>
                        Play Now
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


    /* ADD SONG CLICK EVENTS */

    songul
        .querySelectorAll("li")
        .forEach((songElement, index) => {

            songElement.addEventListener(
                "click",
                () => {

                    currentIndex = index;

                    playMusic(
                        songs[index]
                    );
                }
            );
        });


    /* LOAD FIRST SONG WITHOUT PLAYING */

    if (songs.length > 0) {

        currentIndex = 0;

        playMusic(
            songs[0],
            true
        );
    }
}


/* =========================================================
   PLAY / PAUSE
========================================================= */

function togglePlay() {

    if (!crruntsong.src) return;

    const playImage =
        document.querySelector("#play img");

    const disc =
        document.querySelector("#disc");


    if (crruntsong.paused) {

        crruntsong
            .play()
            .then(() => {

                playImage.src =
                    "pause.svg";

                disc.classList.add(
                    "rotate"
                );
            });

    }
    else {

        crruntsong.pause();

        playImage.src =
            "play.svg";

        disc.classList.remove(
            "rotate"
        );
    }
}


/* =========================================================
   NEXT SONG
========================================================= */

function nextSong() {

    if (!songs.length) return;

    if (
        currentIndex + 1 <
        songs.length
    ) {

        currentIndex++;

        playMusic(
            songs[currentIndex]
        );
    }
}


/* =========================================================
   PREVIOUS SONG
========================================================= */

function previousSong() {

    if (!songs.length) return;

    if (currentIndex - 1 >= 0) {

        currentIndex--;

        playMusic(
            songs[currentIndex]
        );
    }
}


/* =========================================================
   SEEK BAR CLICK
========================================================= */

function setupSeekbar() {

    const seekbar =
        document.querySelector(".seekbar");

    if (!seekbar) return;


    seekbar.addEventListener(
        "click",
        event => {

            if (!Number.isFinite(
                crruntsong.duration
            )) {
                return;
            }


            const rect =
                seekbar.getBoundingClientRect();


            /*
             * IMPORTANT:
             *
             * Horizontal bar =
             * clientX / width
             *
             * NOT offsetY / height
             */

            const clickX =
                event.clientX - rect.left;


            let percent =
                clickX / rect.width;


            percent =
                Math.max(
                    0,
                    Math.min(1, percent)
                );


            crruntsong.currentTime =
                crruntsong.duration *
                percent;


            updateSeekbar(
                percent * 100
            );
        }
    );
}


/* =========================================================
   -5 SECONDS
========================================================= */

function setupSkipButtons() {

    const minus =
        document.querySelector("#minus5sec");

    const plus =
        document.querySelector("#plus5sec");


    if (minus) {

        minus.addEventListener(
            "click",
            event => {

                event.stopPropagation();

                crruntsong.currentTime =
                    Math.max(
                        0,
                        crruntsong.currentTime - 5
                    );
            }
        );
    }


    if (plus) {

        plus.addEventListener(
            "click",
            event => {

                event.stopPropagation();

                if (!Number.isFinite(
                    crruntsong.duration
                )) {
                    return;
                }

                crruntsong.currentTime =
                    Math.min(
                        crruntsong.duration,
                        crruntsong.currentTime + 5
                    );
            }
        );
    }
}


/* =========================================================
   AUDIO EVENTS
========================================================= */

function setupAudioEvents() {

    /* METADATA */

    crruntsong.addEventListener(
        "loadedmetadata",
        () => {

            document.querySelector(
                ".songtime"
            ).innerHTML =
                `00:00 / ${formatTime(
                    crruntsong.duration
                )}`;

            updateSeekbar(0);
        }
    );


    /* TIME UPDATE */

    crruntsong.addEventListener(
        "timeupdate",
        () => {

            if (!Number.isFinite(
                crruntsong.duration
            )) {
                return;
            }


            const current =
                formatTime(
                    crruntsong.currentTime
                );


            const duration =
                formatTime(
                    crruntsong.duration
                );


            document.querySelector(
                ".songtime"
            ).innerHTML =
                `${current} / ${duration}`;


            const percent =
                (
                    crruntsong.currentTime /
                    crruntsong.duration
                ) * 100;


            updateSeekbar(percent);
        }
    );


    /* PLAY */

    crruntsong.addEventListener(
        "play",
        () => {

            document.querySelector(
                "#play img"
            ).src = "pause.svg";


            document.querySelector(
                "#disc"
            ).classList.add("rotate");
        }
    );


    /* PAUSE */

    crruntsong.addEventListener(
        "pause",
        () => {

            document.querySelector(
                "#play img"
            ).src = "play.svg";


            document.querySelector(
                "#disc"
            ).classList.remove("rotate");
        }
    );


    /* SONG ENDED */

    crruntsong.addEventListener(
        "ended",
        () => {

            if (
                currentIndex + 1 <
                songs.length
            ) {

                currentIndex++;

                playMusic(
                    songs[currentIndex]
                );
            }
            else {

                document.querySelector(
                    "#play img"
                ).src = "play.svg";

                document.querySelector(
                    "#disc"
                ).classList.remove(
                    "rotate"
                );
            }
        }
    );
}


/* =========================================================
   VOLUME
========================================================= */

function setupVolume() {

    const volume =
        document.querySelector(
            "#voulme input"
        );

    if (!volume) return;


    volume.addEventListener(
        "input",
        event => {

            crruntsong.volume =
                event.target.value / 100;
        }
    );
}


/* =========================================================
   MAIN
========================================================= */

async function main() {

    await getsongs("songs/cs");

    displayAlbums();

    await loadAlbum("songs/cs");

    document
        .querySelector("#play")
        .addEventListener(
            "click",
            togglePlay
        );


    document
        .querySelector("#previous")
        .addEventListener(
            "click",
            previousSong
        );


    document
        .querySelector("#next")
        .addEventListener(
            "click",
            nextSong
        );


    setupSeekbar();

    setupSkipButtons();

    setupAudioEvents();

    setupVolume();
}


/* =========================================================
   START
========================================================= */

main();
