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
    | Promise<{ visible: boolean; error?: Error }>
    | { visible: boolean; error?: Error };
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
        /*@ts-expect-error Type mismatch between js and ts*/
        <DynamicPageComponent.Column key={col.header} title={col.header}>
          {col.value(resource)}
        </DynamicPageComponent.Column>
      ))}
    </>
  );
}
