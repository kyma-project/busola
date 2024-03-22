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
  const { tFromStoreKeys } = useGetTranslation();

  const columns = schema.get('columns');
  const gridTemplateColumns = `repeat(${columns}, 1fr)`;

  const defaultOpen = schema.get('defaultExpanded') ?? false;
  const schemaRequired = schema.get('required') ?? required;

  return (
    <ResourceForm.CollapsibleSection
      title={tFromStoreKeys(storeKeys, schema)}
      defaultOpen={defaultOpen}
      nestingLevel={nestingLevel}
      required={schemaRequired}
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
