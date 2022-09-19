import { Text } from './Text';
import { Plain } from './Plain';
import { Columns } from './Columns';
import { Panel } from './Panel';
import { CodeViewer } from './CodeViewer';
import { Badge } from './Badge';
import { Table } from './Table';
import { ResourceRefs } from './ResourceRefs';
import { ControlledBy } from './ControlledBy';
import { JoinedArray } from './JoinedArray';
import { ResourceList } from './ResourceList';
import { ResourceLink } from './ResourceLink.js';
import { Labels } from './Labels';
import { Message } from './Message';

import { PendingWrapper } from './PendingWrapper';

export const widgets = {
  Null: () => '',
  Badge,
  Text,
  Plain,
  Panel,
  Columns,
  CodeViewer,
  Table,
  ResourceRefs,
  ControlledBy,
  JoinedArray,
  ResourceList,
  ResourceLink,
  Labels,
  Message,
};

export const valuePreprocessors = {
  PendingWrapper,
};
