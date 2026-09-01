const HOST_NAME = 'com.46dvniiel.discord_channel_host';

const statusEl = document.getElementById('status');
const resultEl = document.getElementById('result');
const errorEl = document.getElementById('error');
const channelEl = document.getElementById('channel');
const serverEl = document.getElementById('server');
const titleEl = document.getElementById('title');
const refreshBtn = document.getElementById('refreshBtn');

function setError(message) {
  resultEl.hidden = true;
  errorEl.hidden = false;
  errorEl.textContent = message;
  statusEl.textContent = 'Failed';
}

function setResult(payload) {
  errorEl.hidden = true;
  resultEl.hidden = false;

  if (!payload.running) {
    statusEl.textContent = 'Discord is not running';
  } else if (!payload.channel) {
    statusEl.textContent = 'Discord is running, but no channel was detected';
  } else {
    statusEl.textContent = 'Connected';
  }

  channelEl.textContent = payload.channel || '-';
  serverEl.textContent = payload.server || '-';
  titleEl.textContent = payload.title || '-';
}

function requestChannel() {
  statusEl.textContent = 'Checking…';

  chrome.runtime.sendNativeMessage(
    HOST_NAME,
    { action: 'getCurrentChannel' },
    (response) => {
      if (chrome.runtime.lastError) {
        setError(`Native host error: ${chrome.runtime.lastError.message}`);
        return;
      }

      if (!response || typeof response !== 'object') {
        setError('Invalid response from native host.');
        return;
      }

      if (response.error) {
        setError(response.error);
        return;
      }

      setResult(response);
    }
  );
}

refreshBtn.addEventListener('click', requestChannel);
requestChannel();
