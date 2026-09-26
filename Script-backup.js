console.log("Hello world");
let crruntsong = new Audio();
let songs;
let currFolder;
async function getsongs(folder) {
    currFolder = folder;

    let a = await fetch(`http://127.0.0.1:3000/${folder}/`);
    let response = await a.text();

    let div = document.createElement("div");
    div.innerHTML = response;

    let as = div.getElementsByTagName("a");

    songs = [];

    for (let index = 0; index < as.length; index++) {
        const element = as[index];

        if (element.href.endsWith(".mp3")) {
            songs.push(
    decodeURIComponent(element.href.split("%5C").pop())
)
        }
    }

    console.log(songs);
    return songs;
    
}
const playMusic = (track, puase=false)=>{
    crruntsong.src = `/${currFolder}/` + track
    if (!puase) {
        crruntsong.play()
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
    let a = await fetch(`http://127.0.0.1:3000/songs/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a");
    let cardcontainer = document.querySelector(".cards");
    let array =  Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if (e.href.includes("/songs/")) {
            let folder = e.href.split("/").slice(-2)[0];
             let a = await fetch(`http://127.0.0.1:3000/songs/`);
            let response = await a.json();
            cardcontainer.innerHTML = cardcontainer.innerHTML + `<div data-folder="cs" class="album-card">
                        <img src="/songs/${folder}/cover.jpeg" alt="">
                        <h2>${response.title}</h2>
                        <h4>${response.discription}
                        </h4>
                    </div>`

           
        }
    };
}

async function main() {
    await getsongs("songs/cs")
    playMusic(songs[0], true)

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