const http = require("http");
const fs = require("fs");
const path = require("path");

const root = __dirname;
const port = Number(process.env.PORT || 10000);

const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon"
};

function safePath(urlPath) {
  const raw = decodeURIComponent((urlPath || "/").split("?")[0]);
  const requested = raw === "/" ? "/index.html" : raw;
  const normalized = path.normalize(requested).replace(/^([.][.][/\\])+/, "");
  const full = path.join(root, normalized);
  return full.startsWith(root) ? full : path.join(root, "index.html");
}

http.createServer((req, res) => {
  let file = safePath(req.url);

  fs.stat(file, (statErr, stat) => {
    if (!statErr && stat.isDirectory()) file = path.join(file, "index.html");

    fs.readFile(file, (err, data) => {
      if (err) {
        fs.readFile(path.join(root, "index.html"), (fallbackErr, fallback) => {
          if (fallbackErr) {
            res.writeHead(404, {"Content-Type":"text/plain; charset=utf-8"});
            return res.end("CUT+STR not found");
          }
          res.writeHead(200, {"Content-Type":"text/html; charset=utf-8","Cache-Control":"no-cache"});
          res.end(fallback);
        });
        return;
      }

      const ext = path.extname(file).toLowerCase();
      res.writeHead(200, {
        "Content-Type": types[ext] || "application/octet-stream",
        "Cache-Control": ext === ".html" ? "no-cache" : "public, max-age=3600"
      });
      res.end(data);
    });
  });
}).listen(port, "0.0.0.0", () => {
  console.log(`CUT+STR listening on port ${port}`);
});
