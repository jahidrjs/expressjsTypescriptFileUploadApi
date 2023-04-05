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
exports.LocalFileAccess = void 0;
const commonHelper_1 = require("./commonHelper");
const fs_1 = __importDefault(require("fs"));
require('dotenv').config();
// Default implementation of file access component with local file system storage
class LocalFileAccess {
    uploadFile(file) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            // Implement upload logic here, return public and private keys
            // console.log('call back function ',file);
            const uplodedFilename = (_a = file === null || file === void 0 ? void 0 : file.filename) !== null && _a !== void 0 ? _a : '';
            const publicKey = (0, commonHelper_1.generatePublicKey)();
            const privateKey = (0, commonHelper_1.generatePrivateKey)();
            const keyData = { publicKey, privateKey, uplodedFilename };
            const saveFileName = `uploadList.json`;
            const filePath = `./${saveFileName}`;
            let existingData = [];
            try {
                const fileData = fs_1.default.readFileSync(filePath);
                existingData = JSON.parse(fileData.toString());
            }
            catch (error) {
                console.log('File not found, creating a new one.');
            }
            if (!Array.isArray(existingData)) {
                existingData = [existingData];
            }
            existingData.push(keyData);
            fs_1.default.writeFileSync(filePath, JSON.stringify(existingData));
            // Upload file and return keys
            return { publicKey, privateKey };
        });
    }
    downloadFile(publicKey, res) {
        return __awaiter(this, void 0, void 0, function* () {
            // Retrieve file path from publicKey
            const fileNamePath = (0, commonHelper_1.getUploadedFilename)(publicKey);
            const filePath = process.env.FOLDER + '/' + fileNamePath;
            if (!filePath) {
                res.status(404).json({ message: 'File not found' });
                return;
            }
            // Check if file exists
            if (!fs_1.default.existsSync(filePath)) {
                res.status(404).json({ message: 'File not found' });
                return;
            }
            // Set appropriate content type based on file extension
            const contentType = (0, commonHelper_1.getContentType)(filePath);
            res.setHeader('Content-Type', contentType);
            // Stream the file to the response
            const stream = fs_1.default.createReadStream(filePath);
            stream.pipe(res);
        });
    }
    deleteFile(privateKey) {
        return __awaiter(this, void 0, void 0, function* () {
            const deleteFileStatus = yield (0, commonHelper_1.deletePriveFile)(privateKey);
            if (deleteFileStatus) {
                const status = true;
                const message = 'file Delete Successfully';
                return { status, message };
            }
            else {
                const status = false;
                const message = 'file Delete Not Successfull';
                return { status, message };
            }
        });
    }
}
exports.LocalFileAccess = LocalFileAccess;
