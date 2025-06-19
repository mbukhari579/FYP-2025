const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Middleware to serve static files
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure Multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  }
});
const upload = multer({ storage: storage });

// Upload route
app.post('/upload-art', upload.single('artImage'), (req, res) => {
  const { title, artist, description, price } = req.body;
  const imageUrl = `/uploads/${req.file.filename}`;

  const newArt = {
    id: Date.now(),
    title,
    artist,
    description,
    price,
    imageUrl
  };

  // Optionally save to a JSON file (simulating a DB)
  const filePath = 'art-db.json';
  let artList = [];

  if (fs.existsSync(filePath)) {
    artList = JSON.parse(fs.readFileSync(filePath));
  }

  artList.push(newArt);
  fs.writeFileSync(filePath, JSON.stringify(artList, null, 2));

  res.json({ success: true, art: newArt });
});

// Get all artworks
app.get('/artworks', (req, res) => {
  const filePath = 'art-db.json';
  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath);
    res.json(JSON.parse(data));
  } else {
    res.json([]);
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});