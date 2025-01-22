import express from 'express';
import path from 'path';

const port = process.env.PORT || 3000

const app = express()

app.use(express.static(path.join(__dirname, 'public')))
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

app.get('/', (req, res) => {
  console.log(`Rendering 'pages/index' for route '/'`);
  res.send('testing app - to render pages/index.ejs');
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
