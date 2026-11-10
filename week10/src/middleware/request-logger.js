export function requestLogger(req, res, next) {
  const started = performance.now();
  res.on("finish", () => {
    if (req.path.startsWith("/api/"))
      console.log(
        `${req.method} ${req.originalUrl} ${res.statusCode} ${Math.round(performance.now() - started)}ms`,
      );
  });
  next();
}
