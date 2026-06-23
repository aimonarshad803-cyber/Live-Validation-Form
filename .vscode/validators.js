/**
 * validators.js
 * Pure validation functions — no DOM access, easy to unit-test.
 * Each returns { valid: Boolean, message: String }.
 */

const Validators = (() => {

  // ── Email ────────────────────────────────────────────────────
  function email(value) {
    if (!value.trim()) return { valid: false, message: 'Email is required.' };
    // RFC-5322-ish pattern
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!re.test(value)) return { valid: false, message: 'Enter a valid email address.' };
    return { valid: true, message: '' };
  }

  // ── Country ──────────────────────────────────────────────────
  function country(value) {
    if (!value) return { valid: false, message: 'Please select your country.' };
    return { valid: true, message: '' };
  }

  // ── Postal Code ──────────────────────────────────────────────
  // Accepts common formats: US (12345 / 12345-6789), UK (SW1A 1AA),
  // Canada (A1A 1A1), general 3–10 alphanumerics.
  function postal(value) {
    if (!value.trim()) return { valid: false, message: 'Postal code is required.' };
    const normalized = value.trim().toUpperCase();
    const us  = /^\d{5}(-\d{4})?$/;
    const uk  = /^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/;
    const ca  = /^[A-Z]\d[A-Z]\s?\d[A-Z]\d$/;
    const gen = /^[A-Z0-9\s\-]{3,10}$/;
    if (!us.test(normalized) && !uk.test(normalized) && !ca.test(normalized) && !gen.test(normalized)) {
      return { valid: false, message: 'Enter a valid postal / ZIP code (e.g. 12345 or SW1A 1AA).' };
    }
    return { valid: true, message: '' };
  }

  // ── Password ─────────────────────────────────────────────────
  function password(value) {
    if (!value) return { valid: false, message: 'Password is required.', strength: 0 };
    if (value.length < 8) return { valid: false, message: 'Password must be at least 8 characters.', strength: 1 };

    let score = 0;
    if (value.length >= 12)          score++;
    if (/[A-Z]/.test(value))         score++;
    if (/[a-z]/.test(value))         score++;
    if (/\d/.test(value))            score++;
    if (/[^A-Za-z0-9]/.test(value))  score++;

    // Minimum: must have at least a digit or uppercase
    if (!/[A-Z0-9]/.test(value)) {
      return { valid: false, message: 'Add at least one uppercase letter or number.', strength: Math.min(score, 1) };
    }

    return { valid: true, message: '', strength: Math.min(score, 4) };
  }

  // ── Confirm Password ─────────────────────────────────────────
  function confirm(value, original) {
    if (!value) return { valid: false, message: 'Please confirm your password.' };
    if (value !== original) return { valid: false, message: 'Passwords do not match.' };
    return { valid: true, message: '' };
  }

  // ── Password Strength Metadata ───────────────────────────────
  const strengthMeta = [
    { label: '',         color: 'transparent',  pct: 0  },
    { label: 'Weak',     color: '#EF4444',       pct: 25 },
    { label: 'Fair',     color: '#F97316',       pct: 50 },
    { label: 'Good',     color: '#EAB308',       pct: 75 },
    { label: 'Strong',   color: '#22C55E',       pct: 100 },
  ];

  return { email, country, postal, password, confirm, strengthMeta };

})();