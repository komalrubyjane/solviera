const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Serve static files from the current folder (images, HTML)
app.use(express.static(__dirname));

// Files for persistent data
const SUBSCRIBERS_FILE = path.join(__dirname, 'subscribers.json');
const ORDERS_FILE = path.join(__dirname, 'orders.json');

// Helper to read data from JSON files
function readJSONFile(filePath, defaultData = []) {
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
      return defaultData;
    }
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error);
    return defaultData;
  }
}

// Helper to write data to JSON files
function writeJSONFile(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error(`Error writing ${filePath}:`, error);
    return false;
  }
}

// Default route serving the main HTML page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// API Endpoint: Dynamic Products Fetch
app.get('/api/products', (req, res) => {
  const products = [
    {
      id: 'toscana-crochet',
      name: 'Toscana Crochet',
      desc: 'Intricately hand-woven crochet mesh tote. Light, breathable, and perfect for resort days.',
      price: 29900,
      img: './tote_crochet.png',
      badge: 'Bestseller'
    },
    {
      id: 'venezia-hibiscus',
      name: 'Venezia Hibiscus',
      desc: 'Plush tufted velvet tote in a deep hibiscus crimson. Features a beautiful white floral motif.',
      price: 26500,
      img: './tote_hibiscus.png',
      badge: null
    },
    {
      id: 'palermo-kitty',
      name: 'Palermo Kitty',
      desc: 'Premium plush tufted signature tote in sunset bubblegum pink. A playful, high-fashion statement piece.',
      price: 22900,
      img: './tote_kitty.png',
      badge: 'New'
    }
  ];
  res.json(products);
});

// API Endpoint: Subscribe to Newsletter
app.post('/api/subscribe', (req, res) => {
  const { email } = req.body;

  if (!email || !email.includes('@')) {
    return res.status(400).json({ success: false, message: 'Invalid email address.' });
  }

  const subscribers = readJSONFile(SUBSCRIBERS_FILE, []);
  if (subscribers.includes(email)) {
    return res.status(200).json({ success: true, message: 'You are already registered on the Solviera Atelier list.' });
  }

  subscribers.push(email);
  writeJSONFile(SUBSCRIBERS_FILE, subscribers);

  console.log(`[Solviera Backend] New subscriber registered: ${email}`);
  res.status(200).json({ 
    success: true, 
    message: 'Welcome to Solviera. You have been added to our private collection release mailing list.' 
  });
});

// API Endpoint: Secure Order Checkout
app.post('/api/checkout', (req, res) => {
  const { shipping, payment, items, total } = req.body;

  if (!shipping || !shipping.email || !shipping.name || !items || items.length === 0) {
    return res.status(400).json({ success: false, message: 'Incomplete shipping details or empty cart.' });
  }

  if (!payment || !payment.number || !payment.expiry) {
    return res.status(400).json({ success: false, message: 'Secure payment credentials missing.' });
  }

  // Generate unique luxury order reference
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  const orderId = `SLV-${randomNum}`;

  const orders = readJSONFile(ORDERS_FILE, []);
  const newOrder = {
    orderId,
    timestamp: new Date().toISOString(),
    shipping: {
      name: shipping.name,
      email: shipping.email,
      address: shipping.address,
      city: shipping.city,
      zip: shipping.zip
    },
    items,
    total,
    status: 'Processing in Atelier'
  };

  orders.push(newOrder);
  writeJSONFile(ORDERS_FILE, orders);

  console.log(`[Solviera Backend] Luxury Order Placed: ${orderId} | Total: ₹${total} | Items: ${items.length}`);
  res.status(200).json({
    success: true,
    orderId,
    message: 'Payment mock authorization successful. Order created in Solviera Atelier.'
  });
});

// API Endpoint: Retrieve Order Details
app.get('/api/orders/:id', (req, res) => {
  const orderId = req.params.id;
  const orders = readJSONFile(ORDERS_FILE, []);
  const order = orders.find(o => o.orderId === orderId);

  if (!order) {
    return res.status(404).json({ success: false, message: 'Order reference not found.' });
  }

  res.json({ success: true, order });
});

// Start server (Only if run directly, not when imported as a serverless function)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`   💎 Solviera Premium E-Commerce Backend Active 💎`);
    console.log(`   Serving atelier at: http://localhost:${PORT}`);
    console.log(`======================================================\n`);
  });
}

module.exports = app;
