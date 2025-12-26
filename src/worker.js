import { getAssetFromKV } from "@cloudflare/kv-asset-handler";
import manifestJSON from "__STATIC_CONTENT_MANIFEST";
const assetManifest = JSON.parse(manifestJSON);

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const pathname = url.pathname;

    // ---- API ROUTE LOGIC ----
    // This matches both /api/v2/moecounter AND /api/v2/moecounter/increment
    if (pathname.startsWith("/api/v2/moecounter")) {
      try {
        const queryNumber = url.searchParams.get("number");
        const counterName = url.searchParams.get("name") || "default";
        const length = parseInt(url.searchParams.get("length") || "6", 10);
        
        // Determine if we should increment based on the URL path
        const isIncrementPath = pathname.includes("/increment");

        let displayValue;

        // 1. If 'number' param is present, it always takes priority (Static)
        if (queryNumber !== null) {
          displayValue = queryNumber;
        } 
        // 2. If path includes /increment, update KV
        else if (isIncrementPath) {
          let kvValue = await env.COUNTER_KV.get(counterName);
          let count = kvValue ? parseInt(kvValue, 10) : 0;
          count += 1;
          await env.COUNTER_KV.put(counterName, count.toString());
          displayValue = count.toString();
        } 
        // 3. Otherwise, just READ from KV (Static counter)
        else {
          let kvValue = await env.COUNTER_KV.get(counterName);
          displayValue = kvValue ? kvValue : "0";
        }

        // Apply Padding/Trimming logic
        const padded = displayValue.toString().padStart(length, "0").slice(-length);

        const origin = url.origin; 
        let html = `<!DOCTYPE html><html><head><style>
          body { margin:0; display:inline-flex; background:transparent; }
          img { display:block; image-rendering:pixelated; height:auto; }
        </style></head><body>`;

        for (const digit of padded) {
          html += `<img src="${origin}/${digit}.gif" alt="${digit}" />`;
        }
        html += "</body></html>";

        return new Response(html, {
          headers: {
            "Content-Type": "text/html",
            "Cache-Control": "no-store",
            "Access-Control-Allow-Origin": "*",
          },
        });
      } catch (err) {
        return new Response(`API Error: ${err.message}`, { status: 500 });
      }
    }

    // ---- STATIC ASSETS (0.gif - 9.gif) ----
    try {
      return await getAssetFromKV(
        { request, waitUntil: ctx.waitUntil.bind(ctx) },
        { ASSET_NAMESPACE: env.__STATIC_CONTENT, ASSET_MANIFEST: assetManifest }
      );
    } catch {
      return new Response("Not Found", { status: 404 });
    }
  },
};