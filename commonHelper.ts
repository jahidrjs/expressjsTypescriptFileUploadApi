import fs from 'fs';
import { UploadedFile } from 'express-fileupload';
import { KeyData } from './interface';
import path from 'path';
require('dotenv').config();

export const generatePublicKey = (): string => {
  // Generate a random public key
  const publicKey =
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15);
  return publicKey;
};

export const generatePrivateKey = (): string => {
  // Generate a random private key
  const privateKey =
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15);
  return privateKey;
};

export async function deletePriveFile(privateKey: string): Promise<boolean> {
  const saveFileName = `uploadList.json`;
  const filePath = `./${saveFileName}`;
  const existingData = JSON.parse(fs.readFileSync(filePath).toString());

  // Find object with matching publicKey
  const objToDelete = existingData.find(
    (data: any) => data.privateKey === privateKey
  );

  // If object with matching publicKey is found, delete the file and remove the object from the array
  if (objToDelete) {
    const { uplodedFilename } = objToDelete;
    const deleteFilePath = process.env.FOLDER + '/' + uplodedFilename;
    fs.unlinkSync(deleteFilePath);
    existingData.splice(existingData.indexOf(objToDelete), 1);
    // Write updated data back to the file
    fs.writeFileSync(filePath, JSON.stringify(existingData));
    return true;
  } else {
    return false;
  }
}

export function getUploadedFilename(publicKey: string): string | undefined {
  const filePath = './uploadList.json';
  if (!fs.existsSync(filePath)) {
    return undefined;
  }

  const jsonData = fs.readFileSync(filePath, 'utf-8');
  const keyDataArray: KeyData[] = JSON.parse(jsonData);
  const keyData = keyDataArray.find((key) => key.publicKey === publicKey);

  if (!keyData) {
    return undefined;
  }

  return keyData.uplodedFilename;
}

export const getContentType = (filePath: string): string => {
  // Get the file extension from the file path
  const extension = path.extname(filePath).toLowerCase();

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
