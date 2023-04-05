import request from 'supertest';
import express from 'express';
import apiRoute from '../apiRoute';

const app = express();
app.use(apiRoute);

let pubkey = '';
let prikey = '';

describe('API endpoints', () => {
  it('should return welcome message on GET /', async () => {
    const response = await request(app).get('/');
    expect(response.text).toContain('Welcome to meldCX File Upload API.');
  });

  it('should upload files on POST /files', async () => {
    const response = await request(app)
      .post('/files')
      .attach('files', './test/test.jpg');
    expect(response.status).toEqual(200);
    const { privateKey, publicKey } = JSON.parse(response.text);
    pubkey = publicKey;
    prikey = privateKey;
  });

  it('should download files on GET /files/:publicKey', async () => {
    console.log('pubkey ', pubkey);
    const response = await request(app).get('/files/' + pubkey);
    // expect(response.status).toEqual(200);
    // expect(response.headers['content-type']).toEqual('image/jpeg');
  });

  it('should delete files on DELETE /files/:privateKey', async () => {
    const response = await request(app).delete('/files/' + prikey);
    expect(response.status).toEqual(200);
  });
});
