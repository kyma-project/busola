import { ControlledBy as CB } from 'shared/components/ControlledBy/ControlledBy';
import { useGetPlaceholder } from 'components/Extensibility/helpers';

interface ControlledByProps {
  value: any;
  structure: any;
}

export function ControlledBy({ value, structure }: ControlledByProps) {
  const { emptyLeafPlaceholder } = useGetPlaceholder(structure);

  return (
    <CB
      ownerReferences={value}
      kindOnly={structure?.kindOnly}
      placeholder={emptyLeafPlaceholder}
    />
  );
}
