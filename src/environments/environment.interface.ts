export interface EnvironmentInterface {
  production: boolean;
  databaseId: string;
  containerId: string;
  partitionKeyValue: string;
  host: string;
  authKey: string;
}
