import { FormItem } from '@ui5/webcomponents-react';
import { DynamicPageComponent } from '../DynamicPageComponent/DynamicPageComponent';

export type CustomColumn = {
  header?: string;
  id?: string;
  value: (resource: any) => React.ReactNode;
  conditionComponent?: boolean;
  fullWidth?: boolean;
  visibility?: (
    resource: any,
  ) =>
    | Promise<{ visible: boolean; error?: Error | null }>
    | { visible: boolean; error?: Error | null };
};

export type CustomColumnsType = Array<CustomColumn>;

type ResourceCustomStatusColumnsProps = {
  filteredStatusColumns: CustomColumnsType;
  resource: any;
};

export function ResourceCustomStatusColumns({
  filteredStatusColumns,
  resource,
}: ResourceCustomStatusColumnsProps) {
  return (
    <>
      {filteredStatusColumns?.map((col) => (
        <FormItem
          key={col.header}
          labelContent={<DynamicPageComponent title={col.header ?? ''} />}
        >
          <div>{col.value(resource)}</div>
        </FormItem>
      ))}
    </>
  );
}
