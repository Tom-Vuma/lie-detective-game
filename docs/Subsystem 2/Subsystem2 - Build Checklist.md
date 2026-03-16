# FINAL SUBSYSTEM 2 (Game Engine (Round loop, timer, scoring, streak)) — BUILD CHECKLIST (What We Completed) #
-----------------------------------------------------------------------------------
• Added core session state variables (score, streak, timerMs, roundIndex, currentRound).
• Implemented nextRound() to generate a new case using random items from pack.
• Implemented statement shuffling using Utils.shuffle.
• Implemented lie detection by finding the index of the single false statement.
• Built a working timer loop using setInterval with 100ms tick updates.
• Added timer UI updates including shrinking bar and low‑time color change.
• Implemented scoring with base points + time bonus.
• Added streak system and dynamic multiplier scaling.
• Implemented difficulty ramp by reducing timerMs every correct answer.
• Implemented input locking to prevent double taps and spam clicks.
• Added correct/wrong visual feedback (highlighting, dim‑true effect).
• Implemented transition delay before next round using setTimeout.
• Added timeout logic that ends the session automatically.
• Implemented endGame() with case report summary.
• Built a minimal game screen UI (case number, pack name, timer, score, streak).
• Connected the game engine to HTML buttons and UI elements.
• Made rounds cycle smoothly for 20+ cases.
• Verified the complete game loop works without errors.
• Connected “Start Session” button to start the gameplay.
• Ensured gameplay updates instantly reflect in UI.
• Ensured the entire engine behaves like a detective‑style case system.
