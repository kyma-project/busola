import { DynamicPageComponent } from '../DynamicPageComponent/DynamicPageComponent';

export function ResourceCustomStatusColumns({
  filteredStatusColumns,
  resource,
}) {
  return (
    <>
      {filteredStatusColumns?.map(col => (
        <DynamicPageComponent.Column key={col.header} title={col.header}>
          {col.value(resource)}
        </DynamicPageComponent.Column>
      ))}
    </>
  );
}
