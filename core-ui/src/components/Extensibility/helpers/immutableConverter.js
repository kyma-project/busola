import { createStore } from '@ui-schema/ui-schema';
import { createOrderedMap } from '@ui-schema/ui-schema/Utils/createMap';

export const getResourceObjFromUIStore = obj => obj.valuesToJS();

export const getUIStoreFromResourceObj = res =>
  createStore(createOrderedMap(res));
