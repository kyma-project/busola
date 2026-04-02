import { isNil } from 'lodash';
import { useTranslation } from 'react-i18next';

import { useGetPlaceholder } from 'components/Extensibility/helpers';

interface ServicePort {
  name?: string;
  port: number;
  protocol?: string;
  targetPort?: number | string;
  nodePort?: number;
  appProtocol?: string;
}

interface ContainerPort {
  name?: string;
  containerPort: number;
  protocol?: string;
}

type PortEntry = ServicePort | ContainerPort;

function formatPort(port: PortEntry): string {
  if ('containerPort' in port) {
    const proto = port.protocol ? `/${port.protocol}` : '';
    return port.name
      ? `${port.name}:${port.containerPort}${proto}`
      : `${port.containerPort}${proto}`;
  }

  const proto = port.protocol ? `/${port.protocol}` : '';
  const base = port.name
    ? `${port.name}: ${port.port}${proto}`
    : `${port.port}${proto}`;

  if (!isNil(port.targetPort) && port.targetPort !== port.port) {
    return `${base} → ${port.targetPort}`;
  }
  return base;
}

interface PortsProps {
  value: any;
  structure: any;
  [key: string]: any;
}

export function Ports({ value, structure }: PortsProps) {
  const { t } = useTranslation();
  const { emptyLeafPlaceholder } = useGetPlaceholder(structure);

  if (isNil(value) || (Array.isArray(value) && value.length === 0)) {
    return emptyLeafPlaceholder;
  }

  if (!Array.isArray(value)) {
    return t('extensibility.widgets.ports.error');
  }

  const separator = structure?.separator ?? 'break';

  if (separator === 'break') {
    return (
      <ul style={{ margin: 0, paddingLeft: '1rem' }}>
        {value.map((port: PortEntry, i: number) => (
          <li key={i}>{formatPort(port)}</li>
        ))}
      </ul>
    );
  }

  return (
    <span>
      {value.map((port: PortEntry, i: number) => (
        <span key={i}>
          {formatPort(port)}
          {i < value.length - 1 && separator}
        </span>
      ))}
    </span>
  );
}

Ports.array = true;
Ports.inline = true;
Ports.copyable = true;
Ports.copyFunction = ({ value, structure }: any) => {
  const sep =
    structure?.separator === 'break' ? '\n' : (structure?.separator ?? ', ');
  if (!Array.isArray(value)) return '';
  return value.map((port: PortEntry) => formatPort(port)).join(sep);
};
