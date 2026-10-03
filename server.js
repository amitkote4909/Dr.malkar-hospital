import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);
const host = '0.0.0.0';

// Serve compiled static assets from dist folder
app.use(express.static(path.join(__dirname, 'dist')));

// Health check endpoint for Cloud Run monitoring
app.get('/healthz', (req, res) => {
  res.status(200).send('OK');
});

// Single Page Application (SPA) catch-all route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, host, () => {
  console.log(`Dr. Malkar Hospital server is listening on http://${host}:${port}`);
});
