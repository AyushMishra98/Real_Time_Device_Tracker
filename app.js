const express = require("express");
const app = express();
const http = require("http");
const socketio = require("socket.io");
const path = require("path"); // Require the path module once

const server = http.createServer(app);
const io = socketio(server);

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public"))); // Serve static files from the "public" directory

// Handle socket connections
io.on("connection", function(socket) {
    // When a user sends their location
    socket.on("send-location", function(data) {
        // Broadcast the location to all connected clients
        io.emit("receive-location", { id: socket.id, ...data });
    });

    // Handle user disconnection
    socket.on("disconnect", function() {
        // Notify all clients that the user has disconnected
        io.emit("user-disconnected", socket.id);
    });
});

// Render the index page
app.get("/", function(req, res) {
    res.render("index");
});

// Start the server
server.listen(8989, () => {
    console.log("Server is running on port 8989");
});
