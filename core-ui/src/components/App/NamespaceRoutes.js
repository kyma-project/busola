import { Routes, Route } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { useTranslation } from 'react-i18next';

import { languageAtom } from 'state/preferences/languageAtom';
import { extensionsState } from 'state/navigation/extensionsAtom';

import { resourceRoutesNamespaced } from 'resources';
import { createExtensibilityRoutes } from './ExtensibilityRoutes';
import { otherRoutesNamespaced } from 'resources/other';

import { IncorrectPath } from './IncorrectPath';

export default function NamespaceRoutes() {
  const { t } = useTranslation();
  const language = useRecoilValue(languageAtom);
  const extensions = useRecoilValue(extensionsState);

  return (
    <Routes>
      <Route
        path="*"
        element={
          <IncorrectPath
            to=""
            message={t('components.incorrect-path.message.namespace')}
          />
        }
      />
      {/* extensibility routes should go first, so if someone overwrites the default view, the new one should have a higher priority */}
      {extensions?.map(cr => createExtensibilityRoutes(cr, language))}
      {resourceRoutesNamespaced}
      {otherRoutesNamespaced}
    </Routes>
  );
}
