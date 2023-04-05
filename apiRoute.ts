import express, { Request, Response } from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { LocalFileAccess } from './fileAccess';
require('dotenv').config();
const { Storage } = require('@google-cloud/storage');

const router = express.Router();

const cloudStorage = new Storage({
  projectId: process.env.GCLOUD_PROJECT_ID,
  keyFilename: process.env.GCLOUD_KEY_FILE,
});

// Define storage location for uploaded files
const uploadFolder =
  process.env.PROVIDER === 'cloud'
    ? process.env.GCLOUD_BUCKET_NAME
    : process.env.FOLDER || './myStorage';

// Define storage options based on provider
let storage;
if (process.env.PROVIDER === 'cloud') {
  const cloudStorage = new Storage({
    projectId: process.env.GCLOUD_PROJECT_ID,
    keyFilename: process.env.GCLOUD_KEY_FILE,
  });
  storage = multer({ storage: cloudStorage });
} else {
  const localStorage = multer.diskStorage({
    destination: uploadFolder,
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + uuidv4();
      cb(null, uniqueSuffix + '-' + file.originalname);
    },
  });
  storage = multer({ storage: localStorage });
}

// Create instance of file access component
const fileAccess = new LocalFileAccess();

// Define middleware for rate limiting by IP address
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: 'Too many requests from this IP, please try again tomorrow',
});

// Apply rate limiting middleware to all routes
router.use(limiter);

router.get('/', (req, res) => {
  res.send('Welcome to meldCX File Upload API.');
});

// Define routes for API endpoints
router.post(
  '/files',
  storage.array('files', 10),
  async (req: Request, res: Response) => {
    try {
      const files = Array.isArray(req.files)
        ? req.files
        : req.files?.files ?? [];

      const keys = files.map(async (file: Express.Multer.File) => {
        return await fileAccess.uploadFile(file);
      });
      const result = await Promise.all(keys);
      res.json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error uploading files' });
    }
  }
);

router.get('/files/:publicKey', async (req: Request, res: Response) => {
  try {
    const publicKey = req.params.publicKey;

    await fileAccess.downloadFile(publicKey, res);
    console.log('hello response', res);
    res.status(200).json({message: "File Download Success"})
  } catch (error) {
    console.error(error);
   // res.status(500).json({ message: 'Error downloading file' });
  }
});

router.delete('/files/:privateKey', async (req: Request, res: Response) => {
  try {
    const privateKey = req.params.privateKey;
    const deleteFileStatus = await fileAccess.deleteFile(privateKey);
    res.status(200).json({deleteFileStatus});
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting file' });
  }
});

export default router;
