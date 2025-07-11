// Rate limiter: Max 200 requests per 1 minutes per IP
import rateLimit from 'express-rate-limit';
import express from 'express';
import path from 'path';

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 200,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

export const serveStaticApp = (app, requestPath, directoryPath) => {
  app.use(requestPath, express.static(path.join(__dirname, directoryPath)));
  app.get(requestPath + '*splat', limiter, (_, res) =>
    res.sendFile(path.join(__dirname + directoryPath + '/index.html')),
  );
};

export const serveMonaco = app => {
  app.use('/vs', express.static(path.join(__dirname, '/core-ui/vs')));
};
