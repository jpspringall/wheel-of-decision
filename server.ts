import { APP_BASE_HREF } from '@angular/common';
import { CommonEngine } from '@angular/ssr';
import express from 'express';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import bootstrap from './src/main.server';

import { CosmosClient, CosmosClientOptions } from '@azure/cosmos';
import { environment } from './src/environments/environment';
import { EnvironmentInterface } from './src/environments/environment.interface';
import * as bodyParser from 'body-parser';
import { UserDao } from 'src/server/models/user.dao';
import { UserList } from 'src/server/routes/user.list';

// The Express app is exported so that it can be used by serverless Functions.
export function app(): express.Express {
  const envInterface = environment as EnvironmentInterface;
  const cors = require('cors');
  const server = express();
  const serverDistFolder = dirname(fileURLToPath(import.meta.url));
  const browserDistFolder = resolve(serverDistFolder, '../browser');
  const indexHtml = join(serverDistFolder, 'index.server.html');

  server.use(bodyParser.json());
  server.use(bodyParser.urlencoded({ extended: false }));
  server.use(cors());

  const commonEngine = new CommonEngine();

  server.set('view engine', 'html');
  server.set('views', browserDistFolder);

  console.log('production', envInterface.production);

  const options: CosmosClientOptions = {
    endpoint: process.env['COSMOS_DB_HOST'] || envInterface.host,
    key: process.env['COSMOS_DB_AUTH_KEY'] || envInterface.authKey,
  };

  const cosmosClient = new CosmosClient(options);
  const userDao = new UserDao({
    cosmosClient,
    databaseId: environment.databaseId,
    containerId: environment.containerId,
  });
  const userList = new UserList(userDao);
  userDao.init().catch((err) => {
    console.error(err);
    console.error(
      'Shutting down because there was an error settinig up the database.'
    );
    process.exit(1);
  });

  server.get('/api/users/:partitionKeyValue', (req, res, next) =>
    userList.getUsers(req, res).catch(next)
  );

  server.post('/api/users', (req, res, next) =>
    userList.recreateUsers(req, res).catch(next)
  );

  server.get('/ping', (req, res) => {
    res.sendStatus(400);
  });

  server.get('/api/**', (req, res) => {
    res.status(404).send('data requests are not yet supported');
  });

  server.post('/api/**', (req, res) => {
    res.status(404).send('data requests are not yet supported');
  });

  // Example Express Rest API endpoints
  // server.get('/api/**', (req, res) => { });
  // Serve static files from /browser
  server.get('*.*', express.static(browserDistFolder, {
    maxAge: '1y'
  }));

  // All regular routes use the Angular engine
  server.get('*', (req, res, next) => {
    const { protocol, originalUrl, baseUrl, headers } = req;

    commonEngine
      .render({
        bootstrap,
        documentFilePath: indexHtml,
        url: `${protocol}://${headers.host}${originalUrl}`,
        publicPath: browserDistFolder,
        providers: [{ provide: APP_BASE_HREF, useValue: baseUrl }],
      })
      .then((html) => res.send(html))
      .catch((err) => next(err));
  });

  return server;
}

function run(): void {
  const port = process.env['PORT'] || 4000;

  // Start up the Node server
  const server = app();
  server.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

run();
