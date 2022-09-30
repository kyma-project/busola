import { failFastFetch } from './queries';
import { getAuthData } from '../auth/auth-storage';
import { config } from './../config';

class clusterOpenApiClass {
  constructor() {
    this.openApi = {};
    this.resourceNameList = [];
  }
  get getOpenApi() {
    return this.openApi;
  }
  get getResourceNameList() {
    return this.resourceNameList;
  }
  async fetch() {
    const authData = getAuthData();
    const clusterOpenApiResponse = await failFastFetch(
      `${config.backendAddress}/openapi/v2`,
      authData,
    );

    //TODO handle the error
    this.openApi = await clusterOpenApiResponse.json();

    this.setResourceNameList();
  }
  clear() {
    console.log('clearing openApi');
    this.openApi = {};
    this.resourceNameList = [];
  }
  setResourceNameList() {
    this.resourceNameList = Object.keys(this.openApi.definitions);
    console.log(this.resourceNameList);
  }
}
export const clusterOpenApi = new clusterOpenApiClass();
