export default {
  async fetch(request) {
    const url = new URL(request.url);

    if (!url.pathname.startsWith("/api/v2/moecounter")) {
      return new Response("Not Found", { status: 404 });
    }

    const number = url.searchParams.get("number") ?? "0";
    const length = parseInt(url.searchParams.get("length") ?? number.length, 10);

    const padded = number.padStart(length, "0").slice(-length);

  let html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<style>
  body {
    margin: 0;
    display: inline-flex;
    background: transparent;
  }
  img {
    display: block;
    image-rendering: pixelated;
    image-rendering: crisp-edges;
    width: auto;
    height: auto;
  }
</style>
</head>
<body>`;

    for (const digit of padded) {
      if (!/^[0-9]$/.test(digit)) {
        return new Response(`Invalid digit: ${digit}`, { status: 400 });
      }

      html += `<img src="/${digit}.gif" alt="${digit}" />`;
    }

    html += `</body></html>`;

    return new Response(html, {
      headers: {
        "Content-Type": "text/html",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  },
};
