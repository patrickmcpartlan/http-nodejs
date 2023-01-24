import { createServer } from 'http';

createServer((req, res) => {
  res.sendFile('index.html', {root: __dirname })
  res.end();
}).listen(process.env.PORT);
