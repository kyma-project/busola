/* eslint-disable import/first */
export { GenericList } from './components/GenericList/GenericList';
export { SearchInput } from './components/GenericList/SearchInput';
export { Pagination } from './components/GenericList/Pagination/Pagination';
export {
  k8sNamePattern,
  K8sNameInput,
  isK8SNameValid,
} from './components/K8sNameInput/K8sNameInput';
export { StringInput } from './components/StringInput/StringInput';
export { InputWithSuffix } from './components/InputWithSuffix/InputWithSuffix';
export { InputWithPrefix } from './components/InputWithPrefix/InputWithPrefix';
export { CollapsiblePanel } from './components/CollapsiblePanel/CollapsiblePanel';
export { Tooltip } from './components/Tooltip/Tooltip';
export { PageHeader } from './components/PageHeader/PageHeader';
export { Spinner } from './components/Spinner/Spinner';
export { CopiableText } from './components/CopiableText/CopiableText';
export { Link } from './components/Link/Link';
export { CopiableLink } from './components/Link/CopiableLink';
export { Modal } from './components/Modal/Modal';
export { Labels } from './components/Labels/Labels';
export { Checkbox } from './components/Checkbox/Checkbox';
export { Dropdown } from './components/Dropdown/Dropdown';
export { FileInput } from './components/FileInput/FileInput';
export { ResourceNotFound } from './components/ResourceNotFound/ResourceNotFound';
export { StatusBadge } from './components/StatusBadge/StatusBadge';
export { TooltipBadge } from './components/TooltipBadge/TooltipBadge';
export { ResourceStatus } from './components/ResourceStatus/ResourceStatus';
export { TextFormItem } from './components/TextFormItem/TextFormItem';
export { Tabs } from './components/Tabs/Tabs';
export { Tab } from './components/Tabs/Tab.js';
export { LabelSelectorInput } from './components/LabelSelectorInput/LabelSelectorInput';
export { CircleProgress } from './components/CircleProgress/CircleProgress';
export { ErrorPanel } from './components/ErrorPanel/ErrorPanel';
export {
  ControlledByKind,
  ControlledBy,
  GoToDetailsLink,
} from './components/ControlledBy/ControlledBy';
export * from './components/SideDrawer/SideDrawer';
export * from './components/ResourcesList/ResourcesList';
export * from './components/ResourceDetails/ResourceDetails';
export * from './components/ReadableCreationTimestamp/ReadableCreationTimestamp';
export * from './components/FormattedDate/FormattedDate';
export * from './components/KeyValueForm/KeyValueForm';
export * from './components/MainFrameRedirection/MainFrameRedirection';
export * from './components/TileButton/TileButton';
export * from './components/VerticalTabs/VerticalTabs';

export * from './forms';
export * from './hooks';
export * from './contexts/MicrofrontendContext';
export * from './contexts/ConfigContext';
export * from './contexts/NotificationContext';
export * from './contexts/Microfrontend';
export * from './contexts/YamlEditorContext/YamlEditorContext';
export * from './contexts/YamlEditorContext/EditorActions';
export * from './contexts/ThemeContext';
export * from './utils/helpers';
export * from './utils/handleSubscriptionArrayEvent';
export * from './utils/getComponentForResource';
export * from './utils/randomNamesGenerator/randomNamesGenerator';
export * from './utils/setupMonaco';
export * from './components/GenericList/actionHandlers/simpleDelete';
export * from './constants/constants';

export * from './components/ModalWithForm/ModalWithForm';

import * as CustomPropTypes from './typechecking/CustomPropTypes';
export { CustomPropTypes };

import { monaco } from '@monaco-editor/react';
import { setupMonaco } from './utils/setupMonaco';

export * from '@monaco-editor/react';
import Editor from '@monaco-editor/react';
export const MonacoEditor = Editor;

import './extend-jsonpath';

setupMonaco(monaco);
