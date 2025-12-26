/**
 * MoeCounter — Independent SDK
 */

const BASE_API_URL = 'https://moecounter.jawandha-moecounter.workers.dev/api/v2/moecounter';

/**
 * Construct URL with query parameters
 */
const constructUrl = (baseUrl, params) => {
  const queryString = Object.entries(params)
    .filter(([, value]) => ['string', 'number', 'boolean'].includes(typeof value))
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join('&');
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
};

/**
 * Fetch HTML from Worker
 */
const httpsGet = async (url) => {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Request failed. Status: ${res.status}`);
    return await res.text();
  } catch (err) {
    console.error("MoeCounter fetch error:", err);
    return `<p style="color:red;">Failed to load counter</p>`;
  }
};

/**
 * 1. Static View: Reads KV but does NOT increment
 */
const remote = async ({ name = "default", ...restOptions } = {}) => {
  const url = constructUrl(BASE_API_URL, { name, ...restOptions });
  return await httpsGet(url);
};

/**
 * 2. Increment View: Updates KV (+1) and returns HTML
 */
const increment = async ({ name = "default", ...restOptions } = {}) => {
  const url = constructUrl(`${BASE_API_URL}/increment`, { name, ...restOptions });
  return await httpsGet(url);
};

/**
 * 3. Local View: Manual number override
 */
const local = async (options = {}) => {
  const url = constructUrl(BASE_API_URL, { ...options });
  return await httpsGet(url);
};

/**
 * Embed counter with a check to prevent (canceled) requests
 */
const embed = async (containerId, name = "default", length = 6, shouldIncrement = true) => {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`MoeCounter: No element with id '${containerId}'`);
    return;
  }

  // --- PREVENT DUPLICATE RUNS ---
  // If this container is already loading, stop this second execution
  if (container.getAttribute('data-moe-loading') === 'true') {
    return;
  }
  
  // Set loading state
  container.setAttribute('data-moe-loading', 'true');

  try {
    // Choose the correct endpoint based on shouldIncrement
    const html = shouldIncrement 
      ? await increment({ name, length }) 
      : await remote({ name, length });

    container.innerHTML = html;
  } finally {
    // Always remove the loading state when finished (or if it fails)
    container.removeAttribute('data-moe-loading');
  }
};

// Export API
module.exports = { local, remote, increment, embed };