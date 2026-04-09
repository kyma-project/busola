import { SomeSchema, StoreKeys } from '@ui-schema/ui-schema';

type SchemaOnChangeParam = {
  storeKeys: StoreKeys;
  scopes: string[];
  type: string;
  schema: SomeSchema;
  required?: boolean;
  index?: number;
  itemValue?: any;
  data?: { value: any };
};

export type SchemaOnChangeParams = SchemaOnChangeParam | SchemaOnChangeParam[];

export type OptionType =
  | string
  | { key?: string; name?: string; description?: string };
