import { createServer } from 'http';
const port = 8800;


createServer((req, res) => {
  res.sendFile('index.html')
  res.end();
}).listen(process.env.PORT);
