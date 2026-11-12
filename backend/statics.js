import express from 'express';
import path from 'path';

export const serveStaticApp = (app, requestPath, directoryPath) => {
  app.use(
    requestPath,
    express.static(path.join(import.meta.dirname, directoryPath)),
  );
  app.get(requestPath + '*splat', (_, res) =>
    res.sendFile(
      path.join(import.meta.dirname + directoryPath + '/index.html'),
    ),
  );
};

export const serveMonaco = (app) => {
  app.use('/vs', express.static(path.join(import.meta.dirname, '/core-ui/vs')));
};
