import { ResourceForm } from 'shared/ResourceForm';
import { useGetTranslation } from 'components/Extensibility/helpers';
import { SomeSchema, StoreKeys } from '@ui-schema/ui-schema';
import './FormGroup.scss';

type FormGroupProps = {
  schema: SomeSchema;
  storeKeys: StoreKeys;
  binding?: { WidgetRenderer?: React.ComponentType<any> };
  nestingLevel?: number;
  required?: boolean;
} & Record<string, any>;

export function FormGroup({
  schema,
  storeKeys,
  binding,
  nestingLevel = 0,
  required = false,
  ...props
}: FormGroupProps) {
  const WidgetRenderer = binding?.WidgetRenderer;
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
        {WidgetRenderer && (
          <WidgetRenderer
            {...props}
            storeKeys={storeKeys}
            schema={ownSchema}
            binding={binding}
            nestingLevel={nestingLevel + 1}
          />
        )}
      </div>
    </ResourceForm.CollapsibleSection>
  );
}
