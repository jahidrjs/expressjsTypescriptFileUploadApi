"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const uuid_1 = require("uuid");
const fileAccess_1 = require("./fileAccess");
require('dotenv').config();
const { Storage } = require('@google-cloud/storage');
const router = express_1.default.Router();
const cloudStorage = new Storage({
    projectId: process.env.GCLOUD_PROJECT_ID,
    keyFilename: process.env.GCLOUD_KEY_FILE,
});
// Define storage location for uploaded files
const uploadFolder = process.env.PROVIDER === 'cloud'
    ? process.env.GCLOUD_BUCKET_NAME
    : process.env.FOLDER || './myStorage';
// Define storage options based on provider
let storage;
if (process.env.PROVIDER === 'cloud') {
    const cloudStorage = new Storage({
        projectId: process.env.GCLOUD_PROJECT_ID,
        keyFilename: process.env.GCLOUD_KEY_FILE,
    });
    storage = (0, multer_1.default)({ storage: cloudStorage });
}
else {
    const localStorage = multer_1.default.diskStorage({
        destination: uploadFolder,
        filename: function (req, file, cb) {
            const uniqueSuffix = Date.now() + '-' + (0, uuid_1.v4)();
            cb(null, uniqueSuffix + '-' + file.originalname);
        },
    });
    storage = (0, multer_1.default)({ storage: localStorage });
}
// Create instance of file access component
const fileAccess = new fileAccess_1.LocalFileAccess();
// Define middleware for rate limiting by IP address
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
    windowMs: 24 * 60 * 60 * 1000,
    max: 1000,
    message: 'Too many requests from this IP, please try again tomorrow',
});
// Apply rate limiting middleware to all routes
router.use(limiter);
router.get('/', (req, res) => {
    res.send('Welcome to meldCX File Upload API.');
});
// Define routes for API endpoints
router.post('/files', storage.array('files', 10), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const files = Array.isArray(req.files)
            ? req.files
            : (_b = (_a = req.files) === null || _a === void 0 ? void 0 : _a.files) !== null && _b !== void 0 ? _b : [];
        const keys = files.map((file) => __awaiter(void 0, void 0, void 0, function* () {
            return yield fileAccess.uploadFile(file);
        }));
        const result = yield Promise.all(keys);
        res.json(result);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error uploading files' });
    }
}));
router.get('/files/:publicKey', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const publicKey = req.params.publicKey;
        yield fileAccess.downloadFile(publicKey, res);
        console.log('hello response', res);
        res.status(200).json({ message: "File Download Success" });
    }
    catch (error) {
        console.error(error);
        // res.status(500).json({ message: 'Error downloading file' });
    }
}));
router.delete('/files/:privateKey', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const privateKey = req.params.privateKey;
        const deleteFileStatus = yield fileAccess.deleteFile(privateKey);
        res.status(200).json({ deleteFileStatus });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error deleting file' });
    }
}));
exports.default = router;
