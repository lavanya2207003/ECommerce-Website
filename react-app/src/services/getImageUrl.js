const API_BASE = import.meta.env.VITE_API_URL || "";

export function getImageUrl(url) {
  if (!url || typeof url !== "string") return url;
  if (url.startsWith("data:")) return url;

  try {
    const parsed = new URL(url);
    if (
      parsed.hostname === "res.cloudinary.com" &&
      parsed.pathname.includes("/image/upload/")
    ) {
      return `${API_BASE}/api/images/proxy?url=${encodeURIComponent(url)}`;
    }
  } catch {
    // Not a valid URL (e.g. relative path) — return as-is
  }

  return url;
}
