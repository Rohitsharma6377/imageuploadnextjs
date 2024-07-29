// pages/api/upload.js

import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Define the storage engine using multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Define the path where files will be stored
    const uploadDir = path.join(process.cwd(), 'public/uploads');

    // Ensure the directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Define the filename (preserve original name)
    cb(null, file.originalname);
  },
});

// Create the multer instance with storage options
const upload = multer({ storage });

export const config = {
  api: {
    bodyParser: false,
  },
};

// Define the API route handler
export default function handler(req, res) {
  // Use multer middleware to handle the file upload
  upload.single('file')(req, res, (err) => {
    if (err) {
      console.error('Error uploading file:', err);
      return res.status(500).json({ error: 'Something went wrong during file upload.' });
    }

    // File information
    const file = req.file;
    const filePath = `/uploads/${file.filename}`;

    // Respond with the file URL
    res.status(200).json({ fileUrl: filePath });
  });
}
