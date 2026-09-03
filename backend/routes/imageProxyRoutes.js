const express = require("express");
const router = express.Router();
const https = require("https");

const ALLOWED_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const ALLOWED_HOSTS = ["res.cloudinary.com"];

function isAllowedCloudinaryUrl(urlString) {
  try {
    const url = new URL(urlString);
    if (!ALLOWED_HOSTS.includes(url.hostname)) return false;
    const pathParts = url.pathname.split("/").filter(Boolean);
    if (pathParts.length < 1) return false;
    if (ALLOWED_CLOUD_NAME && pathParts[0] !== ALLOWED_CLOUD_NAME) return false;
    return true;
  } catch {
    return false;
  }
}

router.get("/proxy", (req, res) => {
  const { url } = req.query;
  if (!url || typeof url !== "string") {
    return res.status(400).json({ message: "Missing url parameter." });
  }

  let decoded;
  try {
    decoded = decodeURIComponent(url);
  } catch {
    return res.status(400).json({ message: "Invalid url encoding." });
  }

  if (!isAllowedCloudinaryUrl(decoded)) {
    return res.status(403).json({ message: "URL not allowed." });
  }

  const fetchUrl = new URL(decoded);
  const options = {
    hostname: fetchUrl.hostname,
    path: fetchUrl.pathname + fetchUrl.search,
    method: "GET",
    headers: { "User-Agent": "LayaStore-ImageProxy/1.0" },
  };

  const proxyReq = https.request(options, (proxyRes) => {
    if (proxyRes.statusCode >= 300 && proxyRes.statusCode < 400 && proxyRes.headers.location) {
      let redirectUrl = proxyRes.headers.location;
      if (redirectUrl.startsWith("/")) {
        redirectUrl = `https://${fetchUrl.hostname}${redirectUrl}`;
      }
      return res.redirect(`/api/images/proxy?url=${encodeURIComponent(redirectUrl)}`);
    }

    const contentType = proxyRes.headers["content-type"] || "image/jpeg";
    const cacheControl = proxyRes.headers["cache-control"] || "public, max-age=86400";

    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", cacheControl);
    res.setHeader("Access-Control-Allow-Origin", "*");

    proxyRes.pipe(res);
  });

  proxyReq.on("error", () => {
    if (!res.headersSent) {
      res.status(502).json({ message: "Failed to fetch image." });
    }
  });

  proxyReq.setTimeout(10000, () => {
    proxyReq.destroy();
    if (!res.headersSent) {
      res.status(504).json({ message: "Image fetch timed out." });
    }
  });

  proxyReq.end();
});

module.exports = router;
