export default {
    async fetch(request, env, context) {
        const url = new URL(request.url);
        let pathname = decodeURIComponent(url.pathname);

        // 🔥 Get subdomain
        const host = url.hostname;
        const baseDomain = "websitse.com";
        let subdomain = "";

        if (host.endsWith(`.${baseDomain}`)) {
            subdomain = host.replace(`.${baseDomain}`, "");
        }

        // 🔥 Subdomain to folder version mapping
        const subdomainMap = {
            zohagarments: "zohaattire_ecommerce_website_id28_v2", // 👈 Add more as needed
        };

        const prefix = subdomainMap[subdomain];
        if (!prefix) {
            return new Response("Subdomain not found", { status: 404 });
        }

        const cache = caches.default;
        const cacheKey = new Request(request.url, request);
        let cachedResponse = await cache.match(cacheKey);

        if (cachedResponse) {
            const newHeaders = new Headers(cachedResponse.headers);
            newHeaders.set("x-worker-cache", "HIT");

            return new Response(cachedResponse.body, {
                status: cachedResponse.status,
                statusText: cachedResponse.statusText,
                headers: newHeaders,
            });
        }

        // 🔍 Try public CDN URL first
        const r2PublicUrl = `https://cdn.websitse.com/${prefix}${pathname}`;
        const cdnResponse = await fetch(r2PublicUrl, {
            headers: request.headers,
            method: request.method,
        });

        if (cdnResponse.ok) {
            const contentType = getContentType(pathname);
            const headers = new Headers(cdnResponse.headers);
            headers.set("content-type", contentType);

            // ✅ All files: 1-year cache
            headers.set("cache-control", "public, max-age=31536000, immutable");

            const response = new Response(cdnResponse.body, {
                headers,
                status: cdnResponse.status,
            });

            headers.set("x-worker-cache", "MISS");
            context.waitUntil(cache.put(cacheKey, response.clone()));
            return response;
        }

        // 🧱 Fallback to R2
        let r2Key = `${prefix}${pathname}`;
        let object = await env.BUSINESS_WEB_BUCKET.get(r2Key);

        // Try index.html for directory path
        if (!object && !pathname.includes(".")) {
            if (!pathname.endsWith("/")) pathname += "/";
            r2Key = `${prefix}${pathname}index.html`;
            object = await env.BUSINESS_WEB_BUCKET.get(r2Key);
        }

        // SPA fallback
        if (!object && !pathname.includes(".")) {
            r2Key = `${prefix}/index.html`;
            object = await env.BUSINESS_WEB_BUCKET.get(r2Key);
        }

        if (!object) {
            return new Response("404 Not Found", { status: 404 });
        }

        const contentType = getContentType(r2Key);
        const headers = new Headers({
            "content-type": contentType,
            "cache-control": "public, max-age=31536000, immutable",
        });

        const response = new Response(object.body, {
            headers,
            status: 200,
        });

        headers.set("x-worker-cache", "MISS");
        context.waitUntil(cache.put(cacheKey, response.clone()));
        return response;
    },
};

// 📦 Guess content type by file extension
function getContentType(path) {
    if (path.endsWith(".html")) return "text/html";
    if (path.endsWith(".css")) return "text/css";
    if (path.endsWith(".js")) return "application/javascript";
    if (path.endsWith(".json")) return "application/json";
    if (path.endsWith(".png")) return "image/png";
    if (path.endsWith(".jpg") || path.endsWith(".jpeg")) return "image/jpeg";
    if (path.endsWith(".svg")) return "image/svg+xml";
    if (path.endsWith(".webp")) return "image/webp";
    if (path.endsWith(".ico")) return "image/x-icon";
    if (path.endsWith(".woff2")) return "font/woff2";
    if (path.endsWith(".woff")) return "font/woff";
    return "application/octet-stream";
}
