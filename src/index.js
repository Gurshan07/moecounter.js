/**
 * MoeCounter — 100% independent version
 * Replaces original moecounter.min.js
 * Works with your own Worker
 */

const API_URL = 'https://moecounter.jawandha-moecounter.workers.dev/api/v2/moecounter';

/**
 * Construct URL with query parameters
 * @param {string} baseUrl
 * @param {object} params
 * @returns {string}
 */
const constructUrl = (baseUrl, params) => {
  const queryString = Object.entries(params)
    .filter(([, value]) => ['string', 'number', 'boolean'].includes(typeof value))
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join('&');
  return `${baseUrl}?${queryString}`;
};

/**
 * Fetch HTML from Worker
 * @param {string} url
 * @returns {Promise<string>}
 */
const httpsGet = async url => {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Request failed. Status code: ${res.status} (${res.statusText})`);
    return res.text();
  } catch (err) {
    console.error("MoeCounter fetch error:", err);
    return `<p style="color:red;">Failed to load counter</p>`;
  }
};

/**
 * Fetch counter HTML from your Worker
 * @param {object} options
 * @returns {Promise<string>}
 */
const fetchCounterHtml = async (options = {}) => {
  const url = constructUrl(API_URL, options);
  return await httpsGet(url);
};

/**
 * Local counter (number override)
 * @param {object} options
 * @returns {Promise<string>}
 */
const local = async (options = {}) => fetchCounterHtml({ number: 0, ...options });

/**
 * Remote counter (by name)
 * @param {object} param0 { name, ...restOptions }
 * @returns {Promise<string>}
 */
const remote = async ({ name = "default", ...restOptions } = {}) => {
  return fetchCounterHtml({ name, ...restOptions });
};

/**
 * Embed counter directly into a page
 * @param {string} containerId - ID of element to insert counter into
 * @param {string} name - KV counter name
 * @param {number} length - Number of digits to pad
 */
const embed = async (containerId, name = "default", length = 6) => {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`MoeCounter embed: No element with id '${containerId}'`);
    return;
  }

  const html = await remote({ name, length });
  container.innerHTML = html;
};

// Export API
module.exports = { local, remote, embed };
