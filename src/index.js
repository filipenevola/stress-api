const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Request counter for metrics
let requestCount = 0;
const startTime = Date.now();

// Middleware to count requests
app.use((req, res, next) => {
  requestCount++;
  next();
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Stress Test API',
    version: '1.0.0',
    endpoints: ['/health', '/api/fast', '/api/slow', '/api/echo', '/api/cpu-intensive', '/api/random-data', '/api/metrics', '/api/error']
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: Math.floor((Date.now() - startTime) / 1000),
    requestCount,
    timestamp: new Date().toISOString()
  });
});

// Fast response endpoint
app.get('/api/fast', (req, res) => {
  res.json({
    message: 'Fast response',
    timestamp: Date.now()
  });
});

// Slow response endpoint with configurable delay
app.get('/api/slow', (req, res) => {
  const delay = parseInt(req.query.delay) || 1000;
  const maxDelay = 5000;
  const actualDelay = Math.min(delay, maxDelay);

  setTimeout(() => {
    res.json({
      message: 'Slow response',
      delay: actualDelay,
      timestamp: Date.now()
    });
  }, actualDelay);
});

// Echo endpoint - returns what was sent
app.post('/api/echo', (req, res) => {
  res.json({
    received: req.body,
    headers: {
      contentType: req.get('Content-Type'),
      userAgent: req.get('User-Agent')
    },
    timestamp: Date.now()
  });
});

// CPU intensive endpoint - fibonacci calculation
app.get('/api/cpu-intensive', (req, res) => {
  const n = Math.min(parseInt(req.query.n) || 30, 40);

  const fibonacci = (num) => {
    if (num <= 1) return num;
    return fibonacci(num - 1) + fibonacci(num - 2);
  };

  const start = Date.now();
  const result = fibonacci(n);
  const duration = Date.now() - start;

  res.json({
    n,
    result,
    computationTime: duration,
    timestamp: Date.now()
  });
});

// Random data endpoint
app.get('/api/random-data', (req, res) => {
  const size = Math.min(parseInt(req.query.size) || 10, 1000);

  const data = Array.from({ length: size }, (_, i) => ({
    id: i + 1,
    value: Math.random(),
    name: `item-${Math.random().toString(36).substring(7)}`,
    active: Math.random() > 0.5
  }));

  res.json({
    count: data.length,
    data,
    timestamp: Date.now()
  });
});

// Metrics endpoint
app.get('/api/metrics', (req, res) => {
  const uptime = Math.floor((Date.now() - startTime) / 1000);
  res.json({
    requestCount,
    uptime,
    requestsPerSecond: uptime > 0 ? (requestCount / uptime).toFixed(2) : 0,
    memoryUsage: process.memoryUsage(),
    timestamp: Date.now()
  });
});

// Error simulation endpoint
app.get('/api/error', (req, res) => {
  const errorRate = parseFloat(req.query.rate) || 0.5;

  if (Math.random() < errorRate) {
    res.status(500).json({
      error: 'Simulated server error',
      timestamp: Date.now()
    });
  } else {
    res.json({
      message: 'Success',
      timestamp: Date.now()
    });
  }
});

app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});
