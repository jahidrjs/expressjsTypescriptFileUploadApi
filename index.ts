import express from 'express';
import routes from './apiRoute';
require('dotenv').config();
const app = express();

// Use routes defined in separate file
app.use('/', routes);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});