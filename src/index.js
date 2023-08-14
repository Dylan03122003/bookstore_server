import bodyParser from 'body-parser';
import cors from 'cors';
import { config } from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import { globalErrorHandler } from './controllers/errorController.js';
import bookRoute from './routes/bookRoute.js';
import orderRoute from './routes/orderRoute.js';
import reviewRoute from './routes/reviewRoute.js';
import userRoute from './routes/userRoute.js';

config();
const database = process.env.MONGO_URL;

const app = express();

// MIDDLEWARES

app.use(cors());
app.use(express.json());
app.use(express.static('public'));
// app.use(bodyParser.json({ limit: '200mb' })); // Adjust the limit as per your requirements

// ROUTES --------------------------------

app.use('/api/users', userRoute);
app.use('/api/books', bookRoute);
app.use('/api/reviews', reviewRoute);
app.use('/api/orders', orderRoute);

app.all('*', function (req, res) {
  res.status(401).json({
    status: 'fail',
    message: `Can't find ${req.originalUrl} on this server`,
  });
});

// GLOBAL MIDDLEWARE --------------------------------

app.use(globalErrorHandler);

// Database connection and listening to incoming requests --------------------------------
const PORT = 3000;
mongoose.connect(database).then(() => {
  console.log('Successfully connected to database');
  app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
  });
});
