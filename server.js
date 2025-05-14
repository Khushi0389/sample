const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files
app.use(express.static(path.join(__dirname, 'public')));

// Serve uploaded media (images/videos) from the 'uploads' folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Setup Multer storage configuration
const uploadDir = path.join(__dirname, 'uploads');  // Absolute path for upload directory
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('Uploads directory created.');
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // Use absolute path for upload directory
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));  // Unique filename
  }
});

const upload = multer({ storage });

// Handle image and video upload
app.post('/upload', upload.single('media'), (req, res) => {
  if (req.file) {
    const mediaUrl = `/uploads/${req.file.filename}`;
    const mediaType = req.file.mimetype.startsWith('video') ? 'video' : 'image';
    res.json({ mediaUrl, mediaType });
  } else {
    res.status(400).send('No file uploaded.');
  }
});

// Gallery route to retrieve all uploaded media (images and videos)
app.get('/gallery', (req, res) => {
  fs.readdir(uploadDir, (err, files) => {
    if (err) {
      console.error('Error reading uploads:', err);
      return res.status(500).json({ error: 'Unable to read upload directory.' });
    }

    const mediaFiles = files.filter(file => /\.(jpg|jpeg|png|gif|mp4|avi)$/i.test(file));
    const mediaUrls = mediaFiles.map(file => ({
      url: `/uploads/${file}`,
      type: file.endsWith('.mp4') || file.endsWith('.avi') ? 'video' : 'image',
    }));
    res.json({ media: mediaUrls });
  });
});

// DELETE route to delete an image or video from the gallery
app.delete('/delete', (req, res) => {
  const { mediaUrl } = req.query;

  if (!mediaUrl) {
    return res.status(400).json({ success: false, message: 'No media URL provided.' });
  }

  // Remove '/uploads' from the mediaUrl to get the correct path
  const mediaPath = path.join(uploadDir, decodeURIComponent(mediaUrl.replace('/uploads/', '')));

  // Check if the file exists and delete it
  fs.unlink(mediaPath, (err) => {
    if (err) {
      console.error('Error deleting file:', err);
      return res.status(500).json({ success: false, message: 'Error deleting media.' });
    }

    res.json({ success: true, message: 'Media deleted successfully.' });
  });
});

// Directory listing for /uploads (for debugging or development purposes)
app.get('/uploads', (req, res) => {
  fs.readdir(uploadDir, (err, files) => {
    if (err) {
      return res.status(500).send('Unable to read uploads directory.');
    }

    const mediaFiles = files.filter(file => /\.(jpg|jpeg|png|gif|mp4|avi)$/i.test(file));
    const mediaLinks = mediaFiles.map(file => `<li><a href="/uploads/${file}">${file}</a></li>`).join('');
    res.send(`<ul>${mediaLinks}</ul>`);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  if (err) {
    console.error('Server error:', err.message);
    res.status(500).send(err.message);
  } else {
    next();
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
