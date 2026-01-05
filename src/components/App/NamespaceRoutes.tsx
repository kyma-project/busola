import { useMemo } from 'react';
import { Routes, Route, useParams } from 'react-router';
import { useAtomValue } from 'jotai';
import { useTranslation } from 'react-i18next';

import { languageAtom } from 'state/settings/languageAtom';
import { extensionsAtom } from 'state/navigation/extensionsAtom';

import { resourceRoutesNamespaced } from 'resources';
import { createExtensibilityRoutes } from './ExtensibilityRoutes';
import { otherRoutesNamespaced } from 'resources/other';
import { IncorrectPath } from './IncorrectPath';
import { useUrl } from 'hooks/useUrl';
import { useGet } from 'shared/hooks/BackendAPI/useGet';

export default function NamespaceRoutes() {
  const { t } = useTranslation();
  const { namespaceId } = useParams();
  const { clusterUrl, namespaceUrl } = useUrl();
  const language = useAtomValue(languageAtom);
  const extensions = useAtomValue(extensionsAtom);

  const extensibilityRoutes = useMemo(() => {
    if (extensions?.length) {
      return extensions.map((extension) =>
        createExtensibilityRoutes(extension, language),
      );
    }
    return null;
  }, [extensions, language]);

  const { error } = useGet(
    namespaceId === '-all-'
      ? `/api/v1/namespaces`
      : `/api/v1/namespaces/${namespaceId}`,
    {
      skip: false,
      pollingInterval: 0,
      onDataReceived: () => {},
    } as any,
  );
  const hasAccessToNamespace =
    JSON.parse(JSON.stringify(error)) === null ||
    JSON.parse(JSON.stringify(error))?.code === 403;
  if (namespaceId !== '-all-' && error && !hasAccessToNamespace) {
    return (
      <IncorrectPath
        to={clusterUrl('overview')}
        message={t('components.incorrect-path.message.cluster')}
      />
    );
  }

  return (
    <Routes>
      {extensibilityRoutes && (
        <Route
          path="*"
          element={
            <IncorrectPath
              to={namespaceUrl('')}
              message={t('components.incorrect-path.message.namespace')}
            />
          }
        />
      )}
      {/* extensibility routes should go first, so if someone overwrites the default view, the new one should have a higher priority */}
      {extensibilityRoutes}
      {resourceRoutesNamespaced}
      {otherRoutesNamespaced}
    </Routes>
  );
}
