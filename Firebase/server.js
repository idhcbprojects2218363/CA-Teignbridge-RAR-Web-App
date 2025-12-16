
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

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      // Be sure to pass `true` as the second argument to `url.parse`.
      // This tells it to parse the query portion of the URL.
      const parsedUrl = parse(req.url, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error handling request', err)
      res.statusCode = 500
      res.end('internal server error')
    }
  })
    .once('error', (err) => {
      console.error(err)
      process.exit(1)
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`)
    })
})
