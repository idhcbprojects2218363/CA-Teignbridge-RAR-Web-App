const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

<<<<<<< Updated upstream
const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost'; // Next.js will use 0.0.0.0 if not specified when run by the host
const port = process.env.PORT || 3000;
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();
=======
require('dotenv').config();
const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')

const dev = process.env.NODE_ENV !== 'production'
const defaultPort = process.env.PORT || 3000;

// Helper to parse command line arguments like --port 9002
const getArg = (argName) => {
  const argIndex = process.argv.indexOf(argName);
  if (argIndex !== -1 && process.argv.length > argIndex + 1) {
    // Handles space-separated arguments (e.g., --port 9002)
    return process.argv[argIndex + 1];
  }
  // Fallback for argName=value format
  const arg = process.argv.find(a => a.startsWith(`${argName}=`));
  if (arg) {
    return arg.split('=')[1];
  }
  return null;
}

// Get port and hostname from command line arguments or use defaults
const port = parseInt(getArg('--port') || defaultPort, 10);
const hostname = getArg('--hostname') || 'localhost';

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()
>>>>>>> Stashed changes

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error handling request:', err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  }).listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
