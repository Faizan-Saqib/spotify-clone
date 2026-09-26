console.log("Hello world");
let crruntsong = new Audio();
let songs;
let currFolder;
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

    console.log(songs);
    return songs;
}
const playMusic = (track, puase=false)=>{
    crruntsong.src = `/${currFolder}/` + track
    if (!puase) {
       crruntsong.play().catch(e => console.error(e))
        play.querySelector("img").src = "pause.svg"
    }
    document.querySelector(".songinfo").innerHTML = decodeURI (track.replaceAll("%20", " ").replaceAll("%5C", ""))  
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);

  const formattedMins = String(mins).padStart(2, '0');
  const formattedSecs = String(secs).padStart(2, '0');

  return `${formattedMins}:${formattedSecs}`;
}


async function displayAlbums() {
    let cardcontainer = document.querySelector(".cards");

    const albums = [
        {
            folder: "cs",
            title: "Chill & Soul",
            description: "A collection of relaxing and soulful tracks."
        },
        {
            folder: "ncs",
            title: "NCS",
            description: "Energetic tracks for every moment."
        }
    ];

    cardcontainer.innerHTML = "";

    albums.forEach(album => {
        cardcontainer.innerHTML += `
            <div data-folder="${album.folder}" class="album-card">
                <img src="/songs/${album.folder}/cover.jpeg" alt="${album.title}">
                <h2>${album.title}</h2>
                <h4>${album.description}</h4>
            </div>
        `;
    });

    Array.from(document.getElementsByClassName("album-card")).forEach(card => {
        card.addEventListener("click", async () => {

            console.log("Album clicked:", card.dataset.folder);

            songs = await getsongs(
                `songs/${card.dataset.folder}`
            );

            let songul = document.querySelector(".songlist ul");
            songul.innerHTML = "";

            for (const song of songs) {
                songul.innerHTML += `
                    <li>
                        <img class="invert" src="music.svg" alt="">
                        <div class="info">
                            <div>${song.replaceAll("%20", " ").replaceAll("%5C", "")}</div>
                        </div>
                        <div class="playnow">
                            <span>Play Now</span>
                            <img class="invert" src="play.svg" alt="">
                        </div>
                    </li>
                `;
            }

            Array.from(songul.getElementsByTagName("li")).forEach(songElement => {
                songElement.addEventListener("click", () => {
                    playMusic(
                        songElement
                            .querySelector(".info")
                            .firstElementChild
                            .innerHTML
                            .trim()
                    );
                });
            });

            if (songs.length > 0) {
                playMusic(songs[0], true);
            }
        });
    });
}
async function main() {
    await getsongs("songs/cs")

    displayAlbums()


let songul = document.querySelector(".songlist").getElementsByTagName("ul")[0] 
songul.innerHTML = " ";   
for (const song of songs) {
    songul.innerHTML = songul.innerHTML + `<li> 
   
                    <img class="invert" src="music.svg" alt="">
                    <div class="info">
                        <div> ${song.replaceAll("%20", " ").replaceAll("%5C", "")}</div>
                        
                    </div>
                    <div class="playnow">
                        <span>play Now</span>
                        <img class="invert" src="play.svg" alt="">
                    </div>
   </li>`
}
Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
    e.addEventListener("click", element => {



        console.log(e.querySelector(".info").firstElementChild.innerHTML);

        playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
    });
}); 

play.addEventListener("click", ()=>{
    if (crruntsong.paused) {
        crruntsong.play()
        play.querySelector("img").src = "pause.svg"
    }
    else {
        crruntsong.pause()
        play.querySelector("img").src = "play.svg"
    }
})

crruntsong.addEventListener("timeupdate", () => {
    console.log(crruntsong.currentTime, crruntsong.duration);

    document.querySelector(".songtime").innerHTML =
        `${formatTime(crruntsong.currentTime)} / ${formatTime(crruntsong.duration)}`;

    let percent = (crruntsong.currentTime / crruntsong.duration) * 100;
    document.querySelector(".circle").style.top = percent + "%";
});


document.querySelector(".seekbar").addEventListener("click", (e) => {
    let percent = (e.offsetY / e.target.getBoundingClientRect().height) * 100;

    document.querySelector(".circle").style.top = percent + "%";
    crruntsong.currentTime = (crruntsong.duration * percent) / 100;
})

document.querySelector("#minus5sec").addEventListener("click", () => {
    crruntsong.currentTime = Math.max(0, crruntsong.currentTime - 5);
})

document.querySelector("#plus5sec").addEventListener("click", () => {
    crruntsong.currentTime = Math.min(crruntsong.duration, crruntsong.currentTime + 5);
})


previous.addEventListener("click", () => {
    let index = songs.indexOf(crruntsong.src.split("/").slice(-1)[0])
    
    if (index - 1 >= 0) {
        playMusic(songs[index - 1])
    }
})

next.addEventListener("click", () => {
    let index = songs.indexOf(crruntsong.src.split("/").slice(-1)[0])
    
    if (index + 1 < songs.length) {
        playMusic(songs[index + 1])
    }
})
document.querySelector("#voulme input").addEventListener("input", (e) => {
    crruntsong.volume = e.target.value / 100;
})

Array.from(document.getElementsByClassName("album-card")).forEach(e => {
    e.addEventListener("click", async item => {

        songs = await getsongs(`songs/${item.currentTarget.dataset.folder}`);

        let songul = document.querySelector(".songlist ul");

        // clear old songs
        songul.innerHTML = "";

        // show new songs
        for (const song of songs) {
            songul.innerHTML += `
            <li>
                <img class="invert" src="music.svg" alt="">
                <div class="info">
                    <div>${song.replaceAll("%20", " ").replaceAll("%5C", "")}</div>
                </div>
                <div class="playnow">
                    <span>play Now</span>
                    <img class="invert" src="play.svg" alt="">
                </div>
            </li>`;
        }

        // add click events to new songs
        Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
            e.addEventListener("click", element => {
                playMusic(
                    e.querySelector(".info").firstElementChild.innerHTML.trim()
                );
            });
        });

        // load first song
        playMusic(songs[0], true);
    });
});

}

main()
