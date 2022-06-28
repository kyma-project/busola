import { useTranslation } from 'react-i18next';
import { useRelationsContext } from '../contexts/RelationsContext';
import { Widget } from './Widget';

export function PendingWrapper({ value, ...props }) {
  const { t } = useTranslation();

  const { getRelatedResourceInPath } = useRelationsContext();

  if (typeof value !== 'object') {
    return value ?? null;
  }
  let { data, loading, error } = value;

  if (loading) {
    return t('common.headers.loading');
  } else if (error) {
    return t('common.messages.error', { error });
  } else {
    const relatedResourcePath = getRelatedResourceInPath(props.structure.path);
    const copiedProps = JSON.parse(JSON.stringify(props));
    copiedProps.structure.path = props.structure.path.replace(
      relatedResourcePath,
      '',
    );
    return <Widget value={data} {...copiedProps} />;
  }
}
