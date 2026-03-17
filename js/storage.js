// js/storage.js
// Lie Detective - Player Profile Storage (localStorage only)

(function () {
    const DEFAULT_PLAYER = {
        nickname: "Detective", // Default player name
        highScore: 0, // Default high score
        bestStreak: 0, // Default best streak
        settings: {
            sound: true, // Sound enabled by default
            vibration: true, // Vibration enabled by default
            theme: "dark" // Default UI theme
        },
        stats: {
            roundsPlayed: 0, // Total rounds played
            lastPlayed: null // Timestamp of last play session
        }
    };

    //load the player profile
    function loadPlayer() {
        const saved = localStorage.getItem("player"); // Retrieve saved player JSON from localStorage
        if (!saved) {
            savePlayer(DEFAULT_PLAYER); // Save default profile if none exists
            return { ...DEFAULT_PLAYER }; // Return a copy of default player object
        }

        try {
            return JSON.parse(saved); // Parse and return stored player data
        } catch (err) {
            console.error("[Storage] Corrupt profile, resetting.", err); // Log error if JSON is invalid
            savePlayer(DEFAULT_PLAYER); // Reset to default profile if data is corrupted
            return { ...DEFAULT_PLAYER }; // Return a fresh default player object
        }
    }
    
    //saved the player profile after created
    function savePlayer(player) {
        localStorage.setItem("player", JSON.stringify(player)); // Convert player object to JSON and store it
    }

    function resetPlayer() {
        localStorage.removeItem("player"); // Remove player data from storage
        location.reload(); // Reload the page to reinitialize app with default data
    }

    window.StorageEngine = {
        loadPlayer, // Expose function to load player data
        savePlayer, // Expose function to save player data
        resetPlayer // Expose function to reset player data
    };
})();