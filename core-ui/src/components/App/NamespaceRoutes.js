import { Routes } from 'react-router-dom';
import { useRecoilValue } from 'recoil';

import { languageAtom } from 'state/preferences/languageAtom';
import { extensionsState } from 'state/navigation/extensionsAtom';

import { resourceRoutesNamespaced } from 'resources';
import { createExtensibilityRoutes } from './ExtensibilityRoutes';
import { otherRoutesNamespaced } from 'resources/other';

export default function NamespaceRoutes() {
  const language = useRecoilValue(languageAtom);
  const extensions = useRecoilValue(extensionsState);

  return (
    <Routes>
      {/* extensibility routes should go first, so if someone overwrites the default view, the new one should have a higher priority */}
      {extensions?.map(cr => createExtensibilityRoutes(cr, language))}
      {resourceRoutesNamespaced}
      {otherRoutesNamespaced}
    </Routes>
  );
}
