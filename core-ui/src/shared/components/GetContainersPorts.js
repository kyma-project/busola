import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';

export function getPorts(ports) {
  if (ports?.length) {
    return (
      <ul>
        {ports.map(port => {
          const portValue = port.name
            ? `${port.name}:${port.containerPort}/${port.protocol}`
            : `${port.containerPort}/${port.protocol}`;
          return <li key={portValue}>{portValue}</li>;
        })}
      </ul>
    );
  } else {
    return EMPTY_TEXT_PLACEHOLDER;
  }
}
