import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// load .env variables into a process.env (for local development)
dotenv.config();
const testEnvVariable = process.env.TESTENV || 999;

const port = process.env.PORT || 3000
const app = express()

// Resolve __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, 'public')))
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

app.get('/', (req, res) => {
  console.log(`Rendering 'pages/index' for route '/' - test ENV: ${testEnvVariable}`);
  res.send(`testing app - to rend pages/index.ejs - test ENV: ${testEnvVariable}`);
})

const server = app.listen(port, () => {
  console.log(`Listening on ${port}`);
});

process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: gracefully shutting down');
  if (server) {
    server.close(() => {
      console.log('HTTP server closed');
    })
  }
});
