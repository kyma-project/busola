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
import { ResourceButton } from './ResourceButton';
import { ExternalLinkButton } from './ExternalLinkButton';
import { EventList } from './EventList';
import { ResourceLink } from './ResourceLink.js';
import { Labels } from './Labels';
import { Alert } from './Alert';
import { ConditionList } from './ConditionList';
import { ExternalLink } from './ExternalLink';
import { Tabs } from './Tabs';
import { Wizard } from './Wizard';
import { FeaturedCard } from './FeaturedCard/FeaturedCard';

import { APIRuleHost } from './APIRules/APIRuleHost';

import { PendingWrapper } from './PendingWrapper';

export const widgets = {
  Null: () => '',
  APIRuleHost,
  Alert,
  Badge,
  CodeViewer,
  Columns,
  ConditionList,
  ControlledBy,
  EventList,
  ExternalLink,
  JoinedArray,
  Labels,
  Panel,
  Plain,
  ResourceButton,
  ExternalLinkButton,
  ResourceLink,
  ResourceList,
  ResourceRefs,
  Table,
  Tabs,
  Text,
  Wizard,
  FeaturedCard,
};

export const valuePreprocessors = {
  PendingWrapper,
};
