import { getAssetFromKV } from "@cloudflare/kv-asset-handler";
import manifestJSON from "__STATIC_CONTENT_MANIFEST";
const assetManifest = JSON.parse(manifestJSON);

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

        let value;

        if (number !== null) {
          value = number;
        } else if (isIncrement) {
          const kv = await env.COUNTER_KV.get(theme);
          const count = (kv ? parseInt(kv, 10) : 0) + 1;
          await env.COUNTER_KV.put(theme, count.toString());
          value = count.toString();
        } else {
          value = (await env.COUNTER_KV.get(theme)) || "0";
        }

        const digits = value.padStart(length, "0").slice(-length);
        const origin = url.origin;

        let html = `<!DOCTYPE html><html><head><style>
          body { margin:0; display:inline-flex; background:transparent; }
          img { image-rendering:pixelated; }
        </style></head><body>`;

        for (const d of digits) {
          html += `<img src="${origin}/${theme}/${d}.gif" alt="${d}" />`;
        }

        html += `</body></html>`;

        return new Response(html, {
          headers: {
            "Content-Type": "text/html",
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
