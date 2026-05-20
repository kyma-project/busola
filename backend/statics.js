/* global __dirname */
import express from 'express';
import path from 'path';

export const serveStaticApp = (app, requestPath, directoryPath) => {
  app.use(requestPath, express.static(path.join(__dirname, directoryPath)));
  app.get(requestPath + '*splat', (_, res) =>
    res.sendFile(path.join(__dirname + directoryPath + '/index.html')),
  );
};

export const serveMonaco = (app) => {
  app.use('/vs', express.static(path.join(__dirname, '/core-ui/vs')));
};
