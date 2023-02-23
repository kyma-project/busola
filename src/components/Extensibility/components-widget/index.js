import { Table } from '../components/Table';

import { PendingWrapper } from '../components/PendingWrapper';

export const widgets = {
  Null: () => '',
  Table,
};

export const valuePreprocessors = {
  PendingWrapper,
};
