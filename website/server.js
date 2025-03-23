const express = require('express');
const path = require('path');
const app = express();
const PORT = 8080;

// Serve static files
app.use(express.static(path.join(__dirname)));

// Serve index.html for all routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Website server running at http://localhost:${PORT}`);
}); 