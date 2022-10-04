import { failFastFetch } from './queries';
import { getAuthData } from '../auth/auth-storage';
import { config } from './../config';

class clusterOpenApiClass {
  constructor() {
    this.openApi = {};
    this.resourcePathIdList = [];
  }
  get getOpenApi() {
    return this.openApi;
  }
  get getResourcePathIdList() {
    return this.resourcePathIdList;
  }
  async fetch() {
    const authData = getAuthData();
    const clusterOpenApiResponse = await failFastFetch(
      `${config.backendAddress}/openapi/v2`,
      authData,
    );

    this.openApi = await clusterOpenApiResponse.json();

    this.setResourcePathIdList();
  }
  clear() {
    this.openApi = {};
    this.resourcePathIdList = [];
  }
  setResourcePathIdList() {
    this.resourcePathIdList = Object.keys(this.openApi.paths);
  }
}
export const clusterOpenApi = new clusterOpenApiClass();
