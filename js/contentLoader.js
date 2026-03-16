console.log("[contentLoader.js] file loaded successfully");

// Content loader + schema validator (no frameworks)
(function () {
  const CONTENT_BASE = './content/';

  // Loads a content pack by name (without .json), validates it, and returns the parsed object.
  async function loadPack(name) {
    const url = `${CONTENT_BASE}${name}.json`;
    let pack;

    try {
      const res = await fetch(url, { cache: 'no-cache' });
      if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
      pack = await res.json();
    } catch (err) {
      console.error(`[ContentLoader] Failed to fetch ${url}`, err);
      throw err;
    }

    // Validate the pack
    const { ok, errors, warnings } = validatePack(pack);

    if (!ok) {
      console.group(`[ContentLoader] Validation FAILED for ${name}`);
      errors.forEach((e) => console.error(' •', e));
      console.groupEnd();
      throw new Error('Pack validation failed');
    }

    if (warnings.length) {
      console.group(`[ContentLoader] Validation warnings for ${name}`);
      warnings.forEach((w) => console.warn(' •', w));
      console.groupEnd();
    }

    console.info(`[ContentLoader] Loaded pack '${pack.packName}' with ${pack.items.length} items.`);
    return pack;
  }

  // Validate whole pack structure
  function validatePack(pack) {
    const errors = [];
    const warnings = [];

    if (!pack || typeof pack !== 'object') {
      errors.push('Pack is not a valid JSON object.');
      return { ok: false, errors, warnings };
    }

    if (!pack.packName) errors.push('Missing packName.');
    if (!Array.isArray(pack.items)) errors.push('Missing or invalid items array.');
    if (typeof pack.version !== 'number') warnings.push('Missing numeric version (optional).');
    if (!pack.language) warnings.push('Missing language (optional).');

    if (Array.isArray(pack.items)) {
      pack.items.forEach((item, idx) => {
        const itemErrors = validateItem(item, idx);
        errors.push(...itemErrors);
      });
    }

    return { ok: errors.length === 0, errors, warnings };
  }

  // Validate a single item
  function validateItem(item, idx) {
    const errors = [];

    if (!item || typeof item !== 'object') {
      errors.push(`Item #${idx}: not an object`);
      return errors;
    }

    if (!item.topic || typeof item.topic !== 'string') {
      errors.push(`Item #${idx}: missing 'topic' string`);
    }

    if (!Array.isArray(item.statements) || item.statements.length !== 3) {
      errors.push(`Item #${idx}: 'statements' must be an array of exactly 3`);
      return errors;
    }

    let falseCount = 0;

    item.statements.forEach((s, sIdx) => {
      if (!s || typeof s !== 'object') {
        errors.push(`Item #${idx} statement #${sIdx}: not an object`);
        return;
      }

      if (typeof s.text !== 'string' || !s.text.trim()) {
        errors.push(`Item #${idx} statement #${sIdx}: missing non-empty 'text'`);
      }

      if (typeof s.truth !== 'boolean') {
        errors.push(`Item #${idx} statement #${sIdx}: 'truth' must be boolean`);
      } else if (s.truth === false) {
        falseCount++;
      }
    });

    if (falseCount !== 1) {
      errors.push(`Item #${idx}: must have exactly ONE lie (found ${falseCount})`);
    }

    if (item.tags && !Array.isArray(item.tags)) {
      errors.push(`Item #${idx}: 'tags' should be an array if present`);
    }

    return errors;
  }

  // Expose globally
  window.ContentLoader = { loadPack };
})();
