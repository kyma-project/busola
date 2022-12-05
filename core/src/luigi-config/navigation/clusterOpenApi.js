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
    this.clear();
    const authData = getAuthData();
    const clusterOpenApiResponse = await failFastFetch(
      `${config.backendAddress}/openapi/v2`,
      authData,
    );

    const result = await clusterOpenApiResponse.json();

    if (result.status === 'Failure') {
      throw Error(`Cannot fetch cluster APIs: ${result.message}.`);
    } else {
      this.openApi = result;
      this.setResourcePathIdList();
    }
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
