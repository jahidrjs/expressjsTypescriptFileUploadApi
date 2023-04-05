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
exports.getContentType = exports.getUploadedFilename = exports.deletePriveFile = exports.generatePrivateKey = exports.generatePublicKey = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
require('dotenv').config();
const generatePublicKey = () => {
    // Generate a random public key
    const publicKey = Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15);
    return publicKey;
};
exports.generatePublicKey = generatePublicKey;
const generatePrivateKey = () => {
    // Generate a random private key
    const privateKey = Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15);
    return privateKey;
};
exports.generatePrivateKey = generatePrivateKey;
function deletePriveFile(privateKey) {
    return __awaiter(this, void 0, void 0, function* () {
        const saveFileName = `uploadList.json`;
        const filePath = `./${saveFileName}`;
        const existingData = JSON.parse(fs_1.default.readFileSync(filePath).toString());
        // Find object with matching publicKey
        const objToDelete = existingData.find((data) => data.privateKey === privateKey);
        // If object with matching publicKey is found, delete the file and remove the object from the array
        if (objToDelete) {
            const { uplodedFilename } = objToDelete;
            const deleteFilePath = process.env.FOLDER + '/' + uplodedFilename;
            fs_1.default.unlinkSync(deleteFilePath);
            existingData.splice(existingData.indexOf(objToDelete), 1);
            // Write updated data back to the file
            fs_1.default.writeFileSync(filePath, JSON.stringify(existingData));
            return true;
        }
        else {
            return false;
        }
    });
}
exports.deletePriveFile = deletePriveFile;
function getUploadedFilename(publicKey) {
    const filePath = './uploadList.json';
    if (!fs_1.default.existsSync(filePath)) {
        return undefined;
    }
    const jsonData = fs_1.default.readFileSync(filePath, 'utf-8');
    const keyDataArray = JSON.parse(jsonData);
    const keyData = keyDataArray.find((key) => key.publicKey === publicKey);
    if (!keyData) {
        return undefined;
    }
    return keyData.uplodedFilename;
}
exports.getUploadedFilename = getUploadedFilename;
const getContentType = (filePath) => {
    // Get the file extension from the file path
    const extension = path_1.default.extname(filePath).toLowerCase();
    switch (extension) {
        case '.jpg':
        case '.jpeg':
            return 'image/jpeg';
        case '.png':
            return 'image/png';
        default:
            return 'application/octet-stream';
    }
};
exports.getContentType = getContentType;
