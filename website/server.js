const express = require('express');
const path = require('path');
const httpProxy = require('http-proxy');
const app = express();
const PORT = 8080;

// Create a proxy server
const proxy = httpProxy.createProxyServer();

// Serve static files
app.use(express.static(path.join(__dirname)));

// Proxy middleware for specific routes
app.use((req, res, next) => {
  if (req.path.startsWith('/generate') || req.path.startsWith('/download/')) {
    proxy.web(req, res, { target: 'http://algorithm:5000' });
  } else {
    next();
  }
});

// Serve index.html for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});
// Start server
app.listen(PORT, () => {
  console.log(`Website server running at http://localhost:${PORT}`);
});