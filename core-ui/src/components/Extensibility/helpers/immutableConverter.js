import { createStore } from '@ui-schema/ui-schema';
import { createOrderedMap } from '@ui-schema/ui-schema/Utils/createMap';

const isImmutableStore = obj =>
  Object.getPrototypeOf(obj).constructor.name === 'Record';

export const getResourceObjFromUIStore = obj =>
  isImmutableStore(obj) ? obj.valuesToJS() : obj;

export const getUIStoreFromResourceObj = res =>
  createStore(createOrderedMap(res));
