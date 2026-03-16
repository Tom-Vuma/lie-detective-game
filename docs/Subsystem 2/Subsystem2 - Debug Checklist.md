# FINAL SUBSYSTEM 2 — DEBUGGING CHECKLIST (What You Fixed) #
-----------------------------------------------------------------------------------
• Fixed the missing <script> tag for game.js (incorrect format → now loads correctly).
• Corrected script ordering so utils.js → contentLoader.js → game.js → glue code.
• Added glue code to pass loadedPack into GameEngine.startGame().
• Fixed ContentLoader reference errors by loading scripts in correct order.
• Ensured GameEngine is attached to window so glue script can find it.
• Fixed issue where loadedPack was not being stored or reused properly.
• Ensured Start Session waits for pack loading if not already loaded.
• Verified DOM elements exist before cacheEls() and bindEvents() run.
• Ensured statement buttons were styled and visible after rendering.
• Added missing .statement-btn CSS to ensure text renders properly.
• Fixed issue where game.js loaded too early or not at all.
• Ensured no HTML entity (>, &) issues remained in inline scripts.
• Confirmed nextRound() runs and timer starts only after startGame().
• Verified that clicking Start Session no longer silently fails.
• Ensured packName text updates after pack is loaded.
• Removed invisible/overridden styles that prevented statements from showing.
• Confirmed no double binding, duplicate listeners, or missing UI references.
• Validated that round rendering now properly fills buttons with statement text.
• Ensured console is clean and free of runtime errors during gameplay.