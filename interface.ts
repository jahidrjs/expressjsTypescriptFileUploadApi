import express, { Request, Response } from 'express';
export interface KeyData {
  publicKey: string;
  privateKey: string;
  uplodedFilename: string;
}

// Define interface for file access component
export interface IFileAccess {
  uploadFile(
    file: Express.Multer.File
  ): Promise<{ publicKey: string; privateKey: string }>;
  downloadFile(publicKey: string, res: Response): Promise<void>;
  deleteFile(privateKey: string): Promise<{ status: boolean; message: string }>;
}
