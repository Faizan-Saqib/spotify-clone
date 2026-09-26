const express = require("express");
const path = require("path");
const serveIndex = require("serve-index");

const app = express();
const PORT = 3000;

// Allow cross-origin requests
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    next();
});

// Serve directory listings for folders
app.use(
    "/songs",
    express.static(path.join(__dirname, "songs")),
    serveIndex(path.join(__dirname, "songs"), {
        icons: true
    })
);

// Serve the rest of the project
app.use(express.static(__dirname));

app.listen(PORT, () => {
    console.log(`Spotify server running at http://127.0.0.1:${PORT}`);
});