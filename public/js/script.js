// Ensure socket.io is properly connected
const socket = io();

// Check if geolocation is available
if (navigator.geolocation) {
    // Watch for the user's position
    navigator.geolocation.watchPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            // Emit the location to the server
            socket.emit("send-location", { latitude, longitude });
        },
        (error) => {
            console.error("Geolocation error: ", error);
        },
        {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0,
        }
    );
} else {
    console.error("Geolocation is not supported by this browser.");
}

// Initialize the Leaflet map
const map = L.map("map").setView([0, 0], 10);

// Add the OpenStreetMap tiles
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors",
}).addTo(map);

// Object to hold markers for all users
const markers = {};

// Listen for location updates from other users
socket.on("receive-location", (data) => {
    const { id, latitude, longitude } = data;

    // Ensure latitude and longitude are defined
    if (latitude !== undefined && longitude !== undefined) {
        // Set the map view to the user's latest location
        map.setView([latitude, longitude]);

        // If marker exists, update its position
        if (markers[id]) {
            markers[id].setLatLng([latitude, longitude]);
        } else {
            // Otherwise, create a new marker for the user
            markers[id] = L.marker([latitude, longitude]).addTo(map);
        }
    }
});

// Handle user disconnection
socket.on("user-disconnected", (id) => {
    // Check if the marker exists for the disconnected user
    if (markers[id]) {
        // Remove the marker from the map and delete it from the markers object
        map.removeLayer(markers[id]);
        delete markers[id];
    }
});
