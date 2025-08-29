import { DynamicPageComponent } from '../DynamicPageComponent/DynamicPageComponent';

export function ResourceCustomStatusColumns({
  filteredStatusColumns,
  resource,
}) {
  return (
    <>
      {filteredStatusColumns
        .filter(col => !col?.conditionComponent)
        ?.filter(col => !col?.fullWidth || col?.fullWidth === false)
        ?.map(col => (
          <DynamicPageComponent.Column key={col.header} title={col.header}>
            {col.value(resource)}
          </DynamicPageComponent.Column>
        ))}
    </>
  );
}
