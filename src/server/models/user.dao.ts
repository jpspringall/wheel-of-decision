import {
  Container,
  CosmosClient,
  Database,
  OperationInput,
} from '@azure/cosmos';
import { User } from 'src/models/user.model';

const partitionKeyName = '/key';
const partitionKeyValue = 'user';
export class UserDao {
  client: CosmosClient;
  databaseId: string;
  collectionId: string;
  database: Database;
  container: Container;
  /**
   * Manages reading, adding, and updating Users in Azure Cosmos DB
   * @param {CosmosClient} cosmosClient
   * @param {string} databaseId
   * @param {string} containerId
   */
  constructor({
    cosmosClient,
    databaseId,
    containerId,
  }: {
    cosmosClient: CosmosClient;
    databaseId: string;
    containerId: string;
  }) {
    this.client = cosmosClient;
    this.databaseId = databaseId;
    this.collectionId = containerId;
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
        paths: [partitionKeyName],
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
      .query(querySpec)
      .fetchAll();
  }

  async getAll() {
    console.debug('Querying for items from the database');
    if (!this.container) {
      throw new Error('Collection is not initialized.');
    }

    const { resources } = await this.container.items.readAll().fetchAll();
    return resources;
  }

  async recreateUsers(users: User[]) {
    var operations: OperationInput[] = (await this.getAll()).map((user) => {
      return {
        operationType: 'Delete',
        partitionKey: partitionKeyValue,
        id: user.id!,
      };
    });

    operations = operations.concat(
      users.map((user) => {
        return {
          operationType: 'Create',
          partitionKey: partitionKeyValue,
          resourceBody: {
            id: user.id,
            spun: user.spun,
            key: partitionKeyValue,
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
