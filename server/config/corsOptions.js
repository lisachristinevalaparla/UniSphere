const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'https://uni-sphere-six.vercel.app',
  process.env.CLIENT_URL,
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow server-to-server or curl requests (no origin)
    if (!origin) return callback(null, true);

    // Normalize origin by removing trailing slashes
    const normalizedOrigin = origin.replace(/\/+$/, '');

    // Match exact allowed origins or any vercel.app preview domain
    const isAllowed =
      allowedOrigins.some((allowed) => allowed && allowed.replace(/\/+$/, '') === normalizedOrigin) ||
      /\.vercel\.app$/.test(new URL(origin).hostname) ||
      /localhost|127\.0\.0\.1/.test(new URL(origin).hostname);

    if (isAllowed) {
      callback(null, true);
    } else {
      console.warn(`⚠️ CORS blocked request from origin: ${origin}`);
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin', 'x-refresh-token'],
  exposedHeaders: ['Set-Cookie'],
};

module.exports = corsOptions;
