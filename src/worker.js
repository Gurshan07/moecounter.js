import { getAssetFromKV } from "@cloudflare/kv-asset-handler";
import manifestJSON from "__STATIC_CONTENT_MANIFEST";
const assetManifest = JSON.parse(manifestJSON);

// Helper: Convert ArrayBuffer to Base64
function arrayBufferToBase64(buffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const pathname = url.pathname;

    // ---------------- API ----------------
    if (pathname.startsWith("/api/v2/moecounter")) {
      try {
        const theme = url.searchParams.get("theme") || "default";
        const number = url.searchParams.get("number");
        const length = parseInt(url.searchParams.get("length") || "6", 10);
        const isIncrement = pathname.endsWith("/increment");

        // NEW: Get the "name" parameter to use as the unique storage key
        // If "name" is provided, we use it. If not, we fall back to "theme" (global shared counter)
        const name = url.searchParams.get("name");
        const storageKey = name || theme;

        // 1. Calculate the counter value
        let value;
        if (number !== null) {
          value = number;
        } else if (isIncrement) {
          // Use storageKey (the unique name) to get/put data
          const kv = await env.COUNTER_KV.get(storageKey);
          const count = (kv ? parseInt(kv, 10) : 0) + 1;
          await env.COUNTER_KV.put(storageKey, count.toString());
          value = count.toString();
        } else {
          // Read only
          value = (await env.COUNTER_KV.get(storageKey)) || "0";
        }

        const digits = value.padStart(length, "0").slice(-length).split('');

        // 2. Fetch Images & Convert to Base64
        const imagePromises = digits.map(async (d) => {
          const filePath = `${theme}/${d}.gif`;
          const key = assetManifest[filePath]; 
          
          if (!key) return null; 

          const fileBuffer = await env.__STATIC_CONTENT.get(key, { type: "arrayBuffer" });
          if (!fileBuffer) return null;
          return `data:image/gif;base64,${arrayBufferToBase64(fileBuffer)}`;
        });

        const base64Images = await Promise.all(imagePromises);

        // 3. Define Dimensions
        const itemWidth = 45; 
        const itemHeight = 100;
        const totalWidth = itemWidth * digits.length;

        // 4. Generate SVG
        let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="${itemHeight}">`;
        
        let x = 0;
        for (const base64 of base64Images) {
          if (base64) {
            svg += `<image x="${x}" y="0" width="${itemWidth}" height="${itemHeight}" href="${base64}" />`;
          }
          x += itemWidth;
        }
        svg += `</svg>`;

        return new Response(svg, {
          headers: {
            "Content-Type": "image/svg+xml",
            "Cache-Control": "no-store", 
            "Access-Control-Allow-Origin": "*"
          }
        });

      } catch (e) {
        return new Response(`API error: ${e.message}`, { status: 500 });
      }
    }

    // ---------------- STATIC FILES ----------------
    try {
      return await getAssetFromKV(
        { request, waitUntil: ctx.waitUntil.bind(ctx) },
        { ASSET_NAMESPACE: env.__STATIC_CONTENT, ASSET_MANIFEST: assetManifest }
      );
    } catch {
      return new Response("Not Found", { status: 404 });
    }
  }
};