import express, { Request, Response } from 'express';
import {
  generatePublicKey,
  generatePrivateKey,
  deletePriveFile,
  getUploadedFilename,
  getContentType,
} from './commonHelper';
import fs from 'fs';
require('dotenv').config();

import { IFileAccess } from './interface';
import { promises as fsPromises } from 'fs';
// Default implementation of file access component with local file system storage
export class LocalFileAccess implements IFileAccess {
  async uploadFile(
    file: Express.Multer.File
  ): Promise<{ publicKey: string; privateKey: string }> {
    // Implement upload logic here, return public and private keys
    // console.log('call back function ',file);
    const uplodedFilename = file?.filename ?? '';
    const publicKey = generatePublicKey();
    const privateKey = generatePrivateKey();

    const keyData = { publicKey, privateKey, uplodedFilename };
    const saveFileName = `uploadList.json`;
    const filePath = `./${saveFileName}`;

    let existingData = [];
    try {
      const fileData = fs.readFileSync(filePath);
      existingData = JSON.parse(fileData.toString());
    } catch (error) {
      console.log('File not found, creating a new one.');
    }

    if (!Array.isArray(existingData)) {
      existingData = [existingData];
    }
    existingData.push(keyData);
    fs.writeFileSync(filePath, JSON.stringify(existingData));

    // Upload file and return keys
    return { publicKey, privateKey };
  }

  async downloadFile(publicKey: string, res: Response): Promise<void> {
    // Retrieve file path from publicKey
    const fileNamePath = getUploadedFilename(publicKey);
    const filePath = process.env.FOLDER + '/' + fileNamePath;

    if (!filePath) {
      res.status(404).json({ message: 'File not found' });
      return;
    }

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      res.status(404).json({ message: 'File not found' });
      return;
    }

    // Set appropriate content type based on file extension
    const contentType = getContentType(filePath);
    res.setHeader('Content-Type', contentType);

    // Stream the file to the response
    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  }

  async deleteFile(
    privateKey: string
  ): Promise<{ status: boolean; message: string }> {
    const deleteFileStatus = await deletePriveFile(privateKey);
    if (deleteFileStatus) {
      const status = true;
      const message = 'file Delete Successfully';
      return { status, message };
    } else {
      const status = false;
      const message = 'file Delete Not Successfull';
      return { status, message };
    }
  }
}
