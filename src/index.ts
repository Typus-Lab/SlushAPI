import express, { Request, Response } from 'express';
import * as functions from '@google-cloud/functions-framework';

const app = express();
app.use(express.json());

import strategiesRouter from './v1/strategies';
import positionsRouter from './v1/positions';
import transactionsRouter from './v1/transactions';

// Simple health check endpoint
app.get('/health', (req: Request, res: Response) => {
    res.status(200).send('OK');
});

// Register v1 routes
app.use('/v1', strategiesRouter);
app.use('/v1', positionsRouter);
app.use('/v1', transactionsRouter);

// Wrap the express app for Google Cloud Functions
functions.http('api', app);

export { app };