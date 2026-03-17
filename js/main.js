// js/main.js
// Lie Detective - Main App Bootstrap (Profile System)

(function () {
    let player = null; // Holds the current player profile in memory

    document.addEventListener("DOMContentLoaded", () => {
        player = StorageEngine.loadPlayer(); // Load player data from localStorage when page is ready
        updateProfileUI(); // Populate UI with loaded player data
        bindProfileEvents(); // Attach event listeners to profile-related elements
    });

    function updateProfileUI() {
        const nameEl = document.getElementById("profileName"); // Input field for player's nickname
        const highScoreEl = document.getElementById("profileHighScore"); // Element displaying high score
        const streakEl = document.getElementById("profileBestStreak"); // Element displaying best streak

        if (nameEl) nameEl.value = player.nickname; // Set nickname input value from player data
        if (highScoreEl) highScoreEl.textContent = player.highScore; // Display player's high score
        if (streakEl) streakEl.textContent = player.bestStreak; // Display player's best streak
    }

    function bindProfileEvents() {
        const nameEl = document.getElementById("profileName"); // Nickname input element
        const resetBtn = document.getElementById("btnResetProfile"); // Button to reset profile
        const loadBtn = document.getElementById("profileLoad"); // Button to manually load profile
        const saveBtn = document.getElementById("profileSave"); // Button to manually save profile

        // Auto-save name
        if (nameEl) {
            nameEl.addEventListener("input", () => {
                player.nickname = nameEl.value || "Detective"; // Update nickname or fallback to default
                StorageEngine.savePlayer(player); // Persist updated player data to localStorage
            });
        }

        // Reset
        if (resetBtn) {
            resetBtn.addEventListener("click", () => {
                if (confirm("Reset all progress?")) { // Ask user for confirmation before reset
                    StorageEngine.resetPlayer(); // Clear saved data and reload app
                }
            });
        }

        // Manual load
        if (loadBtn) {
            loadBtn.addEventListener("click", () => {
                player = StorageEngine.loadPlayer(); // Reload player data from storage
                updateProfileUI(); // Refresh UI with newly loaded data
                alert("Profile loaded."); // Notify user of successful load
            });
        }

        // Manual save
        if (saveBtn) {
            saveBtn.addEventListener("click", () => {
                StorageEngine.savePlayer(player); // Save current player state to storage
                alert("Profile saved."); // Notify user of successful save
            });
        }
    }

    // Allow GameEngine to update profile
    window.PlayerProfile = {
        get: () => player, // Provide access to current player data
        save: (updated) => {
            player = updated; // Replace current player with updated data
            StorageEngine.savePlayer(player); // Persist updated player to storage
            updateProfileUI(); // Refresh UI to reflect new data
        }
    };
})();