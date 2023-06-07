import 'zone.js/node';

import { ngExpressEngine } from '@nguniversal/express-engine';
import * as express from 'express';
import { join } from 'path';

import { APP_BASE_HREF } from '@angular/common';
import { AppServerModule } from './src/main.server';

import { CosmosClient, CosmosClientOptions } from '@azure/cosmos';

import { existsSync } from 'fs';
import { UserDao } from 'src/server/models/user.dao';
import { UserList } from 'src/server/routes/user.list';
import { environment } from './src/environments/environment';
import { EnvironmentInterface } from './src/environments/environment.interface';

import bodyParser = require('body-parser');

// The Express app is exported so that it can be used by serverless Functions.
export function app() {
  const envInterface = environment as EnvironmentInterface;
  const cors = require('cors');
  const server = express();
  const distFolder = existsSync(join(process.cwd(), 'dist/browser'))
    ? join(process.cwd(), 'dist/browser')
    : join(process.cwd(), '../../dist/browser');
  const indexHtml = 'index.html';

  server.use(bodyParser.json());
  server.use(bodyParser.urlencoded({ extended: false }));
  server.use(cors());

  // Our Universal express-engine (found @ https://github.com/angular/universal/tree/main/modules/express-engine)
  server.engine(
    'html',
    ngExpressEngine({
      bootstrap: AppServerModule,
    })
  );

  server.set('view engine', 'html');
  server.set('views', distFolder);

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

  server.get('/api/users', (req, res, next) =>
    userList.getUsers(req, res).catch(next)
  );

  server.post('/api/users', (req, res, next) =>
    userList.recreateUsers(req, res).catch(next)
  );

  server.get('/api/**', (req, res) => {
    res.status(404).send('data requests are not yet supported');
  });

  server.post('/api/**', (req, res) => {
    res.status(404).send('data requests are not yet supported');
  });

  // Serve static files from /browser
  server.get(
    '*.*',
    express.static(distFolder, {
      maxAge: '1y',
    })
  );

  // All regular routes use the Universal engine
  server.get('*', (req, res) => {
    res.render(indexHtml, {
      req,
      providers: [{ provide: APP_BASE_HREF, useValue: req.baseUrl }],
    });
  });

  const errorHandler = (error: any, request: any, response: any, _: any) => {
    // Error handling middleware functionality
    console.log(`error ${error.message}`); // log the error
    const status = error.status || 400;
    // send back an easily understandable error message to the caller
    response.status(status).send(error.message + '\n' + error.stack);
  };

  server.use(errorHandler);

  return server;
}

function run() {
  const port = process.env['PORT'] || 4000;

  // Start up the Node server
  const server = app();
  server.listen(port, () => {
    console.log(`Node Express server listening on ${port}`);
  });
}

// Webpack will replace 'require' with '__webpack_require__'
// '__non_webpack_require__' is a proxy to Node 'require'
// The below code is to ensure that the server is run only when not requiring the bundle.
declare const __non_webpack_require__: NodeRequire;
const mainModule = __non_webpack_require__.main;
const moduleFilename = (mainModule && mainModule.filename) || '';
if (moduleFilename === __filename || moduleFilename.includes('iisnode')) {
  run();
}

export * from './src/main.server';
