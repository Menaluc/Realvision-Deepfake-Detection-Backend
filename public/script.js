/** POST target: same origin when served from the app
 *  otherwise hit the local API (file:// or Live Server). */
function getPredictUrl() {
  if (window.location.protocol === 'file:') {
    return 'http://localhost:3000/api/predict';
  }
  var h = window.location.hostname;
  var p = window.location.port;
  if ((h === 'localhost' || h === '127.0.0.1') && p && p !== '3000') {
    return 'http://localhost:3000/api/predict';
  }
  return '/api/predict';
}

const form = document.getElementById('predictForm');
const videoInput = document.getElementById('videoInput');
const submitBtn = document.getElementById('submitBtn');
const statusEl = document.getElementById('status');
const previewWrap = document.getElementById('previewWrap');
const previewVideo = document.getElementById('previewVideo');
const previewMeta = document.getElementById('previewMeta');

// Object URLs reference the selected File in memory
//  and revoke when discarding so the tab does not leak blob handles.
let previewObjectUrl = null;

function revokePreviewUrl() {
  if (previewObjectUrl) {
    URL.revokeObjectURL(previewObjectUrl);
    previewObjectUrl = null;
  }
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatFileSize(bytes) {
  if (!bytes && bytes !== 0) return '—';
  if (bytes < 1024) return bytes + ' B';
  var u = 1024;
  if (bytes < u * u) return (bytes / u).toFixed(1) + ' KB';
  if (bytes < u * u * u) return (bytes / (u * u)).toFixed(1) + ' MB';
  return (bytes / (u * u * u)).toFixed(1) + ' GB';
}

// Drive the local <video> preview from the file input without uploading
//  and createObjectURL bridges File → playable src.
function syncPreviewFromInput() {
  revokePreviewUrl();
  var file = videoInput.files && videoInput.files[0];
  if (!file) {
    previewWrap.hidden = true;
    previewMeta.textContent = '';
    previewVideo.removeAttribute('src');
    previewVideo.load();
    return;
  }
  previewObjectUrl = URL.createObjectURL(file);
  previewVideo.src = previewObjectUrl;
  previewMeta.innerHTML =
    '<span class="preview-name">' + escapeHtml(file.name) + '</span> · ' + formatFileSize(file.size);
  previewWrap.hidden = false;
}

videoInput.addEventListener('change', syncPreviewFromInput);

// API returns confidence in [0, 1]; accept [0, 100] too so a different backend contract still displays sensibly.
function toConfidencePercent(value) {
  var n = Number(value);
  if (Number.isNaN(n)) return 0;
  if (n >= 0 && n <= 1) return Math.min(100, Math.max(0, Math.round(n * 100)));
  return Math.min(100, Math.max(0, Math.round(n)));
}

// Static, tone-matched copy for the demo explainability panel (not returned by the API).
function getXaiCopy(tone) {
  if (tone === 'fake') {
    return {
      lead:
        'Several visual cues point to manipulation or synthesis: small inconsistencies that may be easy to miss in a single frame but become more noticeable across the full clip.',
      bullets: [
        'Uneven facial or hair details.',
        'Facial motion or blinking that looks slightly off compared with the rest of the scene.',
        'Brief moments where the image looks unnaturally smooth, stretched, or “patched” between frames.',
      ],
    };
  }
  if (tone === 'real') {
    return {
      lead:
        'The footage matches patterns commonly seen in authentic video: steady motion, consistent texture, and natural timing throughout the clip.',
      bullets: [
        'Expressions and head motion remain natural',
        'Background and skin detail stay consistent',
        'Rhythm and micro-movements remain stable across frames',
      ],
    };
  }
  return {
    lead:
      'The system compared a few straightforward signals in your video and leaned toward this outcome based on the clearest overall pattern.',
    bullets: [
      'How faces and motion hold up when the scene or camera moves',
      'Whether faces, lighting, and edges look steady from one moment to the next',
      'General consistency with footage the model usually labels as authentic',
    ],
  };
}

function resetDemo() {
  statusEl.style.display = 'none';
  statusEl.className = 'card status';
  statusEl.innerHTML = '';
  videoInput.value = '';
  syncPreviewFromInput();
  videoInput.focus();
}

// Centralizes status card updates so loading, errors, and success reuse one DOM surface and class strategy.
function setStatus({
  kind,
  message,
  prediction,
  confidence,
  debug,
  loading,
  fileName,
  fileSize,
}) {
  statusEl.style.display = 'block';
  statusEl.className = 'card status';
  // Spinner path: no prediction payload yet, but the card should still announce activity to screen readers.
  if (loading) {
    statusEl.classList.add('status-neutral');
    statusEl.innerHTML =
      '<div class="loading-row" role="status">' +
      '<span class="spinner" aria-hidden="true"></span>' +
      '<span>Analyzing video...</span>' +
      '</div>';
    return;
  }
  if (kind === 'error') statusEl.classList.add('error');
  else if (kind === 'result') {
    statusEl.classList.add('result');
    var p = String(prediction || '')
      .trim()
      .toLowerCase();
    if (p === 'fake') statusEl.classList.add('result--fake');
    else if (p === 'real') statusEl.classList.add('result--real');
    else statusEl.classList.add('result--default');
  } else {
    statusEl.classList.add('status-neutral');
  }

  // Success payload: one template keeps badge tone, bar, XAI, and metadata visually consistent.
  if (prediction !== undefined && confidence !== undefined) {
    var predNorm = String(prediction || '')
      .trim()
      .toLowerCase();
    var tone = predNorm === 'fake' ? 'fake' : predNorm === 'real' ? 'real' : 'default';
    var badgeLabel =
      tone === 'fake' ? 'Fake' : tone === 'real' ? 'Real' : escapeHtml(String(prediction || 'Result'));
    var explain =
      tone === 'fake'
        ? 'High likelihood of manipulation detected'
        : tone === 'real'
          ? 'No strong signs of manipulation detected'
          : 'Analysis complete for this clip.';
    var pct = toConfidencePercent(confidence);
    var sizeLabel = fileSize !== undefined ? formatFileSize(fileSize) : '—';
    var nameHtml = fileName != null ? escapeHtml(fileName) : '—';
    // Narrative bullets follow the same fake/real/default tone as the badge for a coherent “why”.
    var xai = getXaiCopy(tone);
    var xaiBullets = xai.bullets
      .map(function (line) {
        return '<li>' + escapeHtml(line) + '</li>';
      })
      .join('');

    statusEl.innerHTML =
      '<div class="result-outcome">' +
      '<div class="result-badge result-badge--' +
      tone +
      '">' +
      badgeLabel +
      '</div>' +
      '<p class="result-explain">' +
      explain +
      '</p>' +
      '</div>' +
      '<div class="confidence-block">' +
      '<div class="confidence-head">' +
      '<span>Confidence</span>' +
      '<span class="confidence-pct">' +
      pct +
      '%</span>' +
      '</div>' +
      '<div class="progress-track" role="progressbar" aria-valuenow="' +
      pct +
      '" aria-valuemin="0" aria-valuemax="100">' +
      '<div class="progress-fill progress-fill--' +
      tone +
      '" style="width:' +
      pct +
      '%"></div>' +
      '</div>' +
      '</div>' +
      '<div class="xai-section">' +
      '<h3 class="xai-title">Why this prediction?</h3>' +
      '<p class="xai-meta">Model-style explanation</p>' +
      '<p class="xai-lead">' +
      escapeHtml(xai.lead) +
      '</p>' +
      '<ul class="xai-list">' +
      xaiBullets +
      '</ul>' +
      '<p class="xai-label">Explanation based on model insights</p>' +
      '</div>' +
      '<div class="result-footer">' +
      '<div class="result-file">' +
      nameHtml +
      ' · ' +
      sizeLabel +
      '</div>' +
      '<div class="result-stamp">Processed just now</div>' +
      '</div>' +
      '<button type="button" class="btn-secondary" id="resetDemoBtn">Analyze another video</button>' +
      (debug ? '<div class="debug">Debug: ' + escapeHtml(String(debug)) + '</div>' : '');

    var resetBtn = document.getElementById('resetDemoBtn');
    if (resetBtn) resetBtn.addEventListener('click', resetDemo);
  } else {
    statusEl.textContent = message || '';
    if (debug) {
      statusEl.innerHTML = statusEl.innerHTML + '<div class="debug">Debug: ' + debug + '</div>';
    }
  }
}

// Multipart POST to /api/predict
//  and URL logic covers file:// and dev servers not on :3000.
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  // Only checks that a file exists here; accept= hints the picker, strict type/size limits are enforced server-side.
  const file = videoInput.files && videoInput.files[0];
  if (!file) {
    setStatus({ kind: 'error', message: 'Please select a video file first.' });
    return;
  }

  // Prevents double submission and pairs with aria-busy for assistive tech during network + upload latency.
  submitBtn.disabled = true;
  submitBtn.setAttribute('aria-busy', 'true');
  setStatus({ loading: true });

  try {
    const formData = new FormData();
    // Field name must match Multer/backend configuration (predict route).
    formData.append('video', file);

    const resp = await fetch(getPredictUrl(), {
      method: 'POST',
      body: formData,
    });

    const data = await resp.json().catch(() => ({}));

    if (!resp.ok) {
      setStatus({
        kind: 'error',
        message: data.message || 'Upload/Inference failed.',
        debug: data.debug,
      });
      return;
    }

    setStatus({
      kind: 'result',
      message: data.message || 'Prediction successful',
      prediction: data.prediction,
      confidence: data.confidence,
      fileName: file.name,
      fileSize: file.size,
      debug: data.debug,
    });
  } catch (err) {
    setStatus({
      kind: 'error',
      message: 'Request failed. Check your server logs and try again.',
    });
  } finally {
    // Early returns in try still run this path, so the button cannot stay disabled after errors or success.
    submitBtn.disabled = false;
    submitBtn.removeAttribute('aria-busy');
  }
});
