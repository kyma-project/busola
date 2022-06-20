import { Text } from './Text';
import { Plain } from './Plain';
import { Columns } from './Columns';
import { Panel } from './Panel';
import { CodeViewer } from './CodeViewer';
import { Badge } from './Badge';
import { Table } from './Table';
import { ControlledBy, ControlledByKind } from './ControlledBy';

export const widgets = {
  Null: () => '',
  Badge,
  Text,
  Plain,
  Panel,
  Columns,
  CodeViewer,
  Table,
  ControlledBy,
  ControlledByKind,
};
