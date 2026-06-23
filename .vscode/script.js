/**
 * app.js
 * Wires up all DOM interactions, live validation, and form submission.
 * Depends on Validators (validators.js).
 */

document.addEventListener('DOMContentLoaded', () => {

  // ── Element refs ─────────────────────────────────────────────
  const form         = document.getElementById('registration-form');
  const emailInput   = document.getElementById('email');
  const countryInput = document.getElementById('country');
  const postalInput  = document.getElementById('postal');
  const pwInput      = document.getElementById('password');
  const cfInput      = document.getElementById('confirm');

  const strengthFill  = document.getElementById('strength-fill');
  const strengthLabel = document.getElementById('strength-label');

  const successOverlay = document.getElementById('success-overlay');
  const resetBtn       = document.getElementById('reset-btn');

  // ── State: tracks which fields have been interacted with ─────
  // (We show validation only after first blur or a submit attempt)
  const touched = {
    email:   false,
    country: false,
    postal:  false,
    password: false,
    confirm: false,
  };

  let submitAttempted = false;

  // ── Helpers ──────────────────────────────────────────────────

  /**
   * Set a field's visual state.
   * @param {string} fieldId  – one of the `touched` keys
   * @param {boolean} isValid
   * @param {string}  message – error text (empty when valid)
   */
  function setState(fieldId, isValid, message) {
    const group = document.getElementById(`group-${fieldId}`);
    const errEl = document.getElementById(`error-${fieldId}`);

    group.classList.remove('is-valid', 'is-invalid');
    group.classList.add(isValid ? 'is-valid' : 'is-invalid');
    errEl.textContent = message;
  }

  /** Clear a field to neutral (no green, no red) */
  function clearState(fieldId) {
    const group = document.getElementById(`group-${fieldId}`);
    const errEl = document.getElementById(`error-${fieldId}`);
    group.classList.remove('is-valid', 'is-invalid');
    errEl.textContent = '';
  }

  /** Show/hide strength bar */
  function updateStrength(score) {
    const meta = Validators.strengthMeta[score];
    strengthFill.style.width      = meta.pct + '%';
    strengthFill.style.background = meta.color;
    strengthLabel.textContent     = meta.label;
    strengthLabel.style.color     = meta.color;
  }

  /** Shake the submit button (visual feedback on invalid submit) */
  function shakeBtn() {
    const btn = document.getElementById('submit-btn');
    btn.classList.remove('shake');
    // Force reflow
    void btn.offsetWidth;
    btn.classList.add('shake');
    btn.addEventListener('animationend', () => btn.classList.remove('shake'), { once: true });
  }

  // ── Validate individual fields ────────────────────────────────

  function validateEmail(forceShow = false) {
    const result = Validators.email(emailInput.value);
    if (touched.email || forceShow) {
      setState('email', result.valid, result.message);
    }
    return result.valid;
  }

  function validateCountry(forceShow = false) {
    const result = Validators.country(countryInput.value);
    if (touched.country || forceShow) {
      setState('country', result.valid, result.message);
    }
    return result.valid;
  }

  function validatePostal(forceShow = false) {
    const result = Validators.postal(postalInput.value);
    if (touched.postal || forceShow) {
      setState('postal', result.valid, result.message);
    }
    return result.valid;
  }

  function validatePassword(forceShow = false) {
    const result = Validators.password(pwInput.value);
    // Always update strength bar if there's a value
    const group = document.getElementById('group-password');
    if (pwInput.value) {
      group.classList.add('has-value');
      updateStrength(result.strength ?? 0);
    } else {
      group.classList.remove('has-value');
      updateStrength(0);
    }
    if (touched.password || forceShow) {
      setState('password', result.valid, result.message);
    }
    return result.valid;
  }

  function validateConfirm(forceShow = false) {
    const result = Validators.confirm(cfInput.value, pwInput.value);
    if (touched.confirm || forceShow) {
      setState('confirm', result.valid, result.message);
    }
    return result.valid;
  }

  // ── Live listeners (validate as you type) ────────────────────

  // Email — validate on input and on blur
  emailInput.addEventListener('input', () => {
    if (touched.email) validateEmail();
  });
  emailInput.addEventListener('blur', () => {
    touched.email = true;
    validateEmail();
  });

  // Country — validate on change and blur
  countryInput.addEventListener('change', () => {
    touched.country = true;
    validateCountry();
  });
  countryInput.addEventListener('blur', () => {
    touched.country = true;
    validateCountry();
  });

  // Postal — validate on input and blur
  postalInput.addEventListener('input', () => {
    if (touched.postal) validatePostal();
  });
  postalInput.addEventListener('blur', () => {
    touched.postal = true;
    validatePostal();
  });

  // Password — validate on every keystroke (also re-check confirm)
  pwInput.addEventListener('input', () => {
    validatePassword();           // always live — strength bar
    if (touched.confirm) validateConfirm();  // keep confirm in sync
  });
  pwInput.addEventListener('blur', () => {
    touched.password = true;
    validatePassword();
  });

  // Confirm — validate on input and blur
  cfInput.addEventListener('input', () => {
    if (touched.confirm) validateConfirm();
  });
  cfInput.addEventListener('blur', () => {
    touched.confirm = true;
    validateConfirm();
  });

  // ── Toggle password visibility ────────────────────────────────
  document.querySelectorAll('.toggle-pw').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.target;
      const input    = document.getElementById(targetId);
      const eyeOpen  = btn.querySelector('.eye-open');
      const eyeClosed= btn.querySelector('.eye-closed');

      if (input.type === 'password') {
        input.type = 'text';
        eyeOpen.style.display  = 'none';
        eyeClosed.style.display= '';
      } else {
        input.type = 'password';
        eyeOpen.style.display  = '';
        eyeClosed.style.display= 'none';
      }
    });
  });

  // ── Form submit ───────────────────────────────────────────────
  form.addEventListener('submit', e => {
    e.preventDefault();
    submitAttempted = true;

    // Mark everything as touched and validate all fields
    Object.keys(touched).forEach(k => { touched[k] = true; });

    const ok = [
      validateEmail(true),
      validateCountry(true),
      validatePostal(true),
      validatePassword(true),
      validateConfirm(true),
    ].every(Boolean);

    if (!ok) {
      shakeBtn();
      // Scroll to the first invalid field
      const firstInvalid = form.querySelector('.is-invalid input, .is-invalid select');
      if (firstInvalid) {
        firstInvalid.focus();
        firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    // 🎉 All good — show success
    successOverlay.hidden = false;
  });

  // ── Reset ─────────────────────────────────────────────────────
  resetBtn.addEventListener('click', () => {
    successOverlay.hidden = true;
    form.reset();

    // Clear all states
    Object.keys(touched).forEach(k => { touched[k] = false; });
    submitAttempted = false;

    ['email', 'country', 'postal', 'password', 'confirm'].forEach(clearState);

    // Reset strength bar
    const pwGroup = document.getElementById('group-password');
    pwGroup.classList.remove('has-value');
    updateStrength(0);

    // Reset eye icons
    document.querySelectorAll('.toggle-pw').forEach(btn => {
      const targetId = btn.dataset.target;
      document.getElementById(targetId).type = 'password';
      btn.querySelector('.eye-open').style.display  = '';
      btn.querySelector('.eye-closed').style.display = 'none';
    });

    emailInput.focus();
  });

  // ── Keyboard: close success overlay on Escape ─────────────────
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !successOverlay.hidden) {
      resetBtn.click();
    }
  });

});


