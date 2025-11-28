import { ReactNode } from 'react';
import { TableCell } from '@ui5/webcomponents-react';

export const BodyFallback = ({
  children,
}: {
  children: ReactNode | ReactNode[];
}) => (
  <TableCell slot="noData" style={{ width: '100%' }}>
    <div className="body-fallback">{children}</div>
  </TableCell>
);
