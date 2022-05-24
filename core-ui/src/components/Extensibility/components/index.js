import { Text } from './Text';
import { Plain } from './Plain';
import { Columns } from './Columns';
import { Panel } from './Panel';
import { CodeViewer } from './CodeViewer';
import { Badge } from './Badge';

export const widgets = {
  Null: () => '',
  Badge,
  Text,
  Plain,
  Panel,
  Columns,
  CodeViewer,
};
