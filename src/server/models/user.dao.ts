import {
  Container,
  CosmosClient,
  Database,
  OperationInput,
} from '@azure/cosmos';
import { UserList } from 'src/models/user.list.model';

const partitionKeyName = 'databaseName';
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
        paths: ['/'.concat(partitionKeyName)],
      },
    });
    this.container = coResponse.container;
    console.debug('Setting up the container...done!');
  }

  async find(partitionKeyValue: string, querySpec: any) {
    console.debug('Querying for items from the database');
    if (!this.container) {
      throw new Error('Collection is not initialized.');
    }
    const { resources } = await this.container.items
      .query(querySpec, { partitionKey: partitionKeyValue })
      .fetchAll();
    return resources;
  }

  async getAll(partitionKeyValue: string) {
    console.debug('Querying for items from the database');
    if (!this.container) {
      throw new Error('Collection is not initialized.');
    }

    const { resources } = await this.container.items
      .readAll({ partitionKey: partitionKeyValue })
      .fetchAll();
    return resources;
  }

  async recreateUsers(userList: UserList) {
    var operations: OperationInput[] = (
      await this.getAll(userList.partitionKeyValue)
    ).map((user) => {
      return {
        operationType: 'Delete',
        partitionKey: userList.partitionKeyValue,
        id: user.id!,
      };
    });

    operations = operations.concat(
      userList.users.map((user) => {
        return {
          operationType: 'Create',
          partitionKey: userList.partitionKeyValue,
          resourceBody: {
            id: user.id,
            toSpin: user.toSpin,
            [partitionKeyName]: userList.partitionKeyValue,
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
