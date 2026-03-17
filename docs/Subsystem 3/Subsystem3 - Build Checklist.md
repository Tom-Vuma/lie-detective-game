# FINAL SUBSYSTEM 3 (Player Profile (localStorage)) #
-----------------------------------------------------------------------------------
-Created storage.js to handle load/save/reset of player data via localStorage.
-Implemented a default player profile structure with nickname, high score, best streak, settings, and stats.
-Added loadPlayer() to auto‑load the profile at application start.
-Added savePlayer() to persist detected profile changes instantly.
-Added resetPlayer() to clear all player data and reload the app.
-Created main.js to bootstrap the profile system and bind UI events.
-Implemented updateProfileUI() to reflect profile data in the UI.
-Enabled real‑time nickname auto‑save via input listener.
-Implemented manual “Load Profile” and “Save Profile” buttons for testing.
-Exposed PlayerProfile object globally for GameEngine integration.
-Connected GameEngine to PlayerProfile to update high score and best streak after each game.
Updated player stats after every session (roundsPlayed, lastPlayed).
Ensured profile UI refreshes automatically after any profile change.
Ensured profile data persists across page reloads.
Fully integrated profile into the visual UI (name, best score, best streak).