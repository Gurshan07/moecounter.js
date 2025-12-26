export default {
  async fetch(request, env) {
    try {
      const url = new URL(request.url);

      // Only handle API routes
      if (!url.pathname.startsWith("/api/v2/moecounter")) {
        return new Response("Not Found", { status: 404 });
      }

      const pathParts = url.pathname.split("/").filter(Boolean);
      const isIncrement = pathParts.includes("increment");

      const counterName = url.searchParams.get("name") || "default";
      const length = parseInt(url.searchParams.get("length") ?? 6, 10);

      // Retrieve current counter from KV
      let number = await env.COUNTER_KV.get(counterName);
      number = number ? parseInt(number) : 0;

      // Increment if /increment route
      if (isIncrement) {
        number += 1;
        await env.COUNTER_KV.put(counterName, number.toString());
      }

      // Pad number
      const padded = number.toString().padStart(length, "0").slice(-length);

      // Generate HTML with GIF digits
      let html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<style>
  body { margin:0; display:inline-flex; background:transparent; }
  img { display:block; image-rendering:pixelated; width:auto; height:auto; }
</style>
</head>
<body>`;

      for (const digit of padded) {
        if (!/^[0-9]$/.test(digit)) {
          return new Response(`Invalid digit: ${digit}`, { status: 400 });
        }
        html += `<img src="/${digit}.gif" alt="${digit}" />`;
      }

      html += "</body></html>";

      return new Response(html, {
        headers: {
          "Content-Type": "text/html",
          "Cache-Control": "no-store", // prevent caching for increment
        },
      });
    } catch (err) {
      console.error(err);
      return new Response("Internal Server Error", { status: 500 });
    }
  },
};
