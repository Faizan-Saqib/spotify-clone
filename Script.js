const currentSong = new Audio();
let songs = [];
let currFolder = "";
let currentIndex = -1;

const songLists = {
  "songs/cs": [
    "Enlivening.mp3", "Final Scene.mp3", "Mawla Ya Salli Wa Sallim.mp3",
    "Naat.mp3", "Tajdar-e-Haram.mp3", "Voyage.mp3", "Wings of Freedom.mp3"
  ],
  "songs/ncs": ["Crazy Frog.mp3"]
};

const albums = [
  { folder: "cs", title: "Chill & Soul", desc: "A collection of relaxing and soulful tracks." },
  { folder: "ncs", title: "NCS", desc: "Energetic tracks for every moment." }
];

/* Inline icons (no external .svg files needed) */
const ICON = {
  play: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 4.5v15l13-7.5z"/></svg>',
  pause: '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="5" y="4" width="4.5" height="16" rx="1"/><rect x="14.5" y="4" width="4.5" height="16" rx="1"/></svg>',
  music: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="4"/><path d="M10 16V8l5-1v8"/><circle cx="8.5" cy="16" r="1.5"/><circle cx="13.5" cy="15" r="1.5"/></svg>',
  playOutline: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M6 4l14 8-14 8z"/></svg>'
};

const $ = s => document.querySelector(s);

function formatTime(sec) {
  if (!Number.isFinite(sec)) return "00:00";
  const m = Math.floor(sec / 60), s = Math.floor(sec % 60);
  return String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0");
}

function escapeHTML(t) {
  return t.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function setPlayingUI(isPlaying) {
  $("#play").innerHTML = isPlaying ? ICON.pause : ICON.play;
  $("#disc").classList.toggle("rotate", isPlaying);
}

function updateSeekbar(percent) {
  percent = Math.max(0, Math.min(100, percent || 0));
  $(".circle").style.left = percent + "%";
  $(".seekbar").style.background =
    `linear-gradient(to right, #00d47e 0%, #12c9b0 ${percent}%, #333 ${percent}%, #333 100%)`;
}

function highlightActive() {
  document.querySelectorAll(".songlist li").forEach(li =>
    li.classList.toggle("active", Number(li.dataset.index) === currentIndex));
}

function playMusic(track, pause = false) {
  const idx = songs.indexOf(track);
  if (idx !== -1) currentIndex = idx;

  currentSong.src = `${currFolder}/${encodeURIComponent(track)}`;
  $(".songinfo").textContent = track.replace(/\.mp3$/i, ".mp3");
  $(".songtime").textContent = "00:00 / 00:00";
  updateSeekbar(0);
  highlightActive();

  if (pause) {
    setPlayingUI(false);
  } else {
    currentSong.play().catch(err => { console.error("Playback error:", err); setPlayingUI(false); });
  }
}

function renderSongs(filter = "") {
  const ul = $(".songlist ul");
  const q = filter.trim().toLowerCase();
  const items = songs.map((s, i) => ({ s, i })).filter(o => o.s.toLowerCase().includes(q));

  if (!items.length) { ul.innerHTML = '<li class="empty">No songs found.</li>'; return; }

  ul.innerHTML = items.map(({ s, i }) => `
    <li data-index="${i}">
      <div class="song-left">${ICON.music}<div class="info" title="${escapeHTML(s)}">${escapeHTML(s)}</div></div>
      <div class="playnow"><span>play Now</span>${ICON.playOutline}</div>
    </li>`).join("");

  ul.querySelectorAll("li[data-index]").forEach(li =>
    li.addEventListener("click", () => {
      currentIndex = Number(li.dataset.index);
      playMusic(songs[currentIndex]);
    }));
  highlightActive();
}

function loadAlbum(folder, autoSelect = true) {
  currFolder = folder;
  songs = songLists[folder] || [];
  $("#search").value = "";
  renderSongs();

  document.querySelectorAll(".album-card").forEach(c =>
    c.classList.toggle("active", `songs/${c.dataset.folder}` === folder));

  if (autoSelect && songs.length) { currentIndex = 0; playMusic(songs[0], true); }
}

function displayAlbums() {
  $(".cards").innerHTML = albums.map(a => `
    <div class="album-card" data-folder="${a.folder}" tabindex="0">
      <div class="card-tag">${a.title}</div>
      <h2>${a.title}</h2>
      <h4>${a.desc}</h4>
    </div>`).join("");

  document.querySelectorAll(".album-card").forEach(card => {
    const open = () => loadAlbum(`songs/${card.dataset.folder}`);
    card.addEventListener("click", open);
    card.addEventListener("keydown", e => { if (e.key === "Enter") open(); });
  });
}

function togglePlay() {
  if (!currentSong.src) return;
  currentSong.paused ? currentSong.play().catch(console.error) : currentSong.pause();
}

function playNext() {
  if (!songs.length) return;
  currentIndex = (currentIndex + 1) % songs.length;
  playMusic(songs[currentIndex]);
}
function playPrev() {
  if (!songs.length) return;
  if (currentSong.currentTime > 3) { currentSong.currentTime = 0; return; }
  currentIndex = (currentIndex - 1 + songs.length) % songs.length;
  playMusic(songs[currentIndex]);
}

function setupSeekbar() {
  const bar = $(".seekbar");
  let dragging = false;

  const seek = e => {
    if (!Number.isFinite(currentSong.duration)) return;
    const x = (e.touches ? e.touches[0].clientX : e.clientX);
    const r = bar.getBoundingClientRect();
    const p = Math.max(0, Math.min(1, (x - r.left) / r.width));
    currentSong.currentTime = currentSong.duration * p;
    updateSeekbar(p * 100);
  };

  bar.addEventListener("pointerdown", e => { dragging = true; bar.setPointerCapture(e.pointerId); seek(e); });
  bar.addEventListener("pointermove", e => { if (dragging) seek(e); });
  bar.addEventListener("pointerup", () => (dragging = false));
  bar.addEventListener("pointercancel", () => (dragging = false));
}

function setupAudioEvents() {
  currentSong.addEventListener("loadedmetadata", () => {
    $(".songtime").textContent = `00:00 / ${formatTime(currentSong.duration)}`;
  });
  currentSong.addEventListener("timeupdate", () => {
    if (!Number.isFinite(currentSong.duration)) return;
    $(".songtime").textContent = `${formatTime(currentSong.currentTime)} / ${formatTime(currentSong.duration)}`;
    updateSeekbar((currentSong.currentTime / currentSong.duration) * 100);
  });
  currentSong.addEventListener("play", () => setPlayingUI(true));
  currentSong.addEventListener("pause", () => setPlayingUI(false));
  currentSong.addEventListener("ended", playNext);
}

function setupVolume() {
  const vol = $("#volume input");
  const paint = v => (vol.style.background = `linear-gradient(to right, #1ed760 ${v}%, #333 ${v}%)`);
  paint(vol.value);
  vol.addEventListener("input", e => {
    currentSong.volume = e.target.value / 100;
    paint(e.target.value);
  });
}

function setupControls() {
  $("#play").addEventListener("click", togglePlay);
  $("#next").addEventListener("click", playNext);
  $("#previous").addEventListener("click", playPrev);
  $("#minus5sec").addEventListener("click", () => {
    currentSong.currentTime = Math.max(0, currentSong.currentTime - 5);
  });
  $("#plus5sec").addEventListener("click", () => {
    if (Number.isFinite(currentSong.duration))
      currentSong.currentTime = Math.min(currentSong.duration, currentSong.currentTime + 5);
  });

  $("#search").addEventListener("input", e => renderSongs(e.target.value));
  $("#home").addEventListener("click", () => { $("#search").value = ""; renderSongs(); });

  document.addEventListener("keydown", e => {
    if (e.target.tagName === "INPUT") return;
    if (e.code === "Space") { e.preventDefault(); togglePlay(); }
    if (e.code === "ArrowRight") $("#plus5sec").click();
    if (e.code === "ArrowLeft") $("#minus5sec").click();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setPlayingUI(false);
  updateSeekbar(0);
  displayAlbums();
  loadAlbum("songs/cs");
  setupControls();
  setupSeekbar();
  setupAudioEvents();
  setupVolume();
});
