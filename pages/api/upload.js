// pages/api/upload.js

import AWS from 'aws-sdk';
import multer from 'multer';
import { IncomingForm } from 'formidable';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

// Configure AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

export const config = {
  api: {
    bodyParser: false,
  },
};

// Use multer to handle file uploads
const upload = multer({ storage: multer.memoryStorage() });

export default async function handler(req, res) {
  // Use multer to process the incoming file
  upload.single('file')(req, res, async (err) => {
    if (err) {
      console.error('Error uploading file:', err);
      return res.status(500).json({ error: 'Something went wrong during file upload.' });
    }

    // Get file from request
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    // Set up S3 upload parameters
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `uploads/${file.originalname}`,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    try {
      // Upload file to S3
      const data = await s3.upload(params).promise();
      res.status(200).json({ fileUrl: data.Location });
    } catch (uploadErr) {
      console.error('Error uploading to S3:', uploadErr);
      res.status(500).json({ error: 'Failed to upload file to S3.' });
    }
  });
}
