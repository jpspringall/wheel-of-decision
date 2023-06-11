import {
  Container,
  CosmosClient,
  Database,
  OperationInput,
} from '@azure/cosmos';
import { User } from 'src/models/user.model';

const partitionKeyName = 'databaseName';
export class UserDao {
  client: CosmosClient;
  databaseId: string;
  collectionId: string;
  partitionKeyValue: string;
  database: Database;
  container: Container;
  /**
   * Manages reading, adding, and updating Users in Azure Cosmos DB
   * @param {CosmosClient} cosmosClient
   * @param {string} databaseId
   * @param {string} containerId
   * @param {string} partitionKeyValue
   */
  constructor({
    cosmosClient,
    databaseId,
    containerId,
    partitionKeyValue,
  }: {
    cosmosClient: CosmosClient;
    databaseId: string;
    containerId: string;
    partitionKeyValue: string;
  }) {
    this.client = cosmosClient;
    this.databaseId = databaseId;
    this.collectionId = containerId;
    this.partitionKeyValue = partitionKeyValue;
    this.database = null as any;
    this.container = null as any;
  }

  async init() {
    console.debug('Setting up the database...');
    const dbResponse = await this.client.databases.createIfNotExists({
      id: this.databaseId,
    });
    this.database = dbResponse.database;
    console.debug('Setting up the database...done!');
    console.debug('Setting up the container...');
    const coResponse = await this.database.containers.createIfNotExists({
      id: this.collectionId,
      partitionKey: {
        paths: ['/'.concat(partitionKeyName)],
      },
    });
    this.container = coResponse.container;
    console.debug('Setting up the container...done!');
  }

  async find(querySpec: any) {
    console.debug('Querying for items from the database');
    if (!this.container) {
      throw new Error('Collection is not initialized.');
    }
    const { resources } = await this.container.items
      .query(querySpec, { partitionKey: this.partitionKeyValue })
      .fetchAll();
  }

  async getAll() {
    console.debug('Querying for items from the database');
    if (!this.container) {
      throw new Error('Collection is not initialized.');
    }

    const { resources } = await this.container.items
      .readAll({ partitionKey: this.partitionKeyValue })
      .fetchAll();
    return resources;
  }

  async recreateUsers(users: User[]) {
    var operations: OperationInput[] = (await this.getAll()).map((user) => {
      return {
        operationType: 'Delete',
        partitionKey: this.partitionKeyValue,
        id: user.id!,
      };
    });

    operations = operations.concat(
      users.map((user) => {
        return {
          operationType: 'Create',
          partitionKey: this.partitionKeyValue,
          resourceBody: {
            id: user.id,
            spun: user.spun,
            [partitionKeyName]: this.partitionKeyValue,
          },
        };
      })
    );

    const result = await this.container.items.bulk(operations, {
      continueOnError: false,
    });

    return result;
  }
}
