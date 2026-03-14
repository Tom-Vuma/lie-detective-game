// Simple utilities exposed on window.Utils for easy use without modules

// shuffle(array) - returns a new array with the elements shuffled
(function () {
  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // pickRandom(array) - returns a random element from the array (or undefined if empty)
  function pickRandom(arr) {
    if (!arr || !arr.length) return undefined;
    return arr[Math.floor(Math.random() * arr.length)];
  }

  window.Utils = { shuffle, pickRandom };
})();
