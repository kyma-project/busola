import { ResourceForm } from 'shared/ResourceForm';
import { useGetTranslation } from 'components/Extensibility/helpers';
import './FormGroup.scss';

export function FormGroup({
  schema,
  storeKeys,
  widgets,
  nestingLevel = 0,
  required = false,
  ...props
}) {
  const { WidgetRenderer } = widgets;
  const ownSchema = schema.delete('widget');
  const { tFromStoreKeys, t: tExt } = useGetTranslation();

  const columns = schema.get('columns');
  const gridTemplateColumns = `repeat(${columns}, 1fr)`;

  const defaultOpen = schema.get('defaultExpanded') ?? false;
  const schemaRequired = schema.get('required') ?? required;
  const tooltipContent = schema.get('description');

  return (
    <ResourceForm.CollapsibleSection
      title={tFromStoreKeys(storeKeys, schema)}
      defaultOpen={defaultOpen}
      nestingLevel={nestingLevel}
      required={schemaRequired}
      tooltipContent={tExt(tooltipContent)}
    >
      <div className="form-group__grid-wrapper" style={{ gridTemplateColumns }}>
        <WidgetRenderer
          {...props}
          storeKeys={storeKeys}
          schema={ownSchema}
          widgets={widgets}
          nestingLevel={nestingLevel + 1}
        />
      </div>
    </ResourceForm.CollapsibleSection>
  );
}
