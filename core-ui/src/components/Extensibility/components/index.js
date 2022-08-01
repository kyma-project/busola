import { Text } from './Text';
import { Plain } from './Plain';
import { Columns } from './Columns';
import { Panel } from './Panel';
import { CodeViewer } from './CodeViewer';
import { Badge } from './Badge';
import { Table } from './Table';
import { ResourceRefs } from './ResourceRefs';
import { ControlledBy, ControlledByKind } from './ControlledBy';
import { JoinedArray } from './JoinedArray';
import { ResourceList } from './ResourceList';
import { ResourceLink } from './ResourceLink.js';
import { Labels } from './Labels';
import { InlineDisplay } from './InlineDisplay';

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
  ControlledByKind,
  JoinedArray,
  ResourceList,
  ResourceLink,
  Labels,
  InlineDisplay,
};

export const valuePreprocessors = {
  PendingWrapper,
};
