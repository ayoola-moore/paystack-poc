// Simple test endpoint to verify public access
export default async function handler(req, res) {
  // Set CORS headers for public access
  res.setHeader('Access-Control-Allow-Credentials', false);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Simple response for any method
  res.status(200).json({
    success: true,
    message: 'Public API endpoint is working!',
    timestamp: new Date().toISOString(),
    method: req.method,
    path: '/api/test'
  });
}
