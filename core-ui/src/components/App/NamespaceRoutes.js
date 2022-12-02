import { useEffect } from 'react';
import { Routes } from 'react-router-dom';
import { useRecoilValue, useRecoilState } from 'recoil';
import { useParams } from 'react-router-dom';

import { languageAtom } from 'state/preferences/languageAtom';
import { activeNamespaceIdState } from 'state/activeNamespaceIdAtom';
import { extensibilityNodesState } from 'state/navigation/extensibilityNodeAtom';

import { resourceRoutesNamespaced } from 'resources';
import { createExtensibilityRoutes } from './ExtensibilityRoutes';
import { otherRoutesNamespaced } from 'resources/other';

export default function NamespaceRoutes() {
  let { namespaceId } = useParams() || {};
  const [namespace, setNamespace] = useRecoilState(activeNamespaceIdState);
  const language = useRecoilValue(languageAtom);
  const extensions = useRecoilValue(extensibilityNodesState);

  useEffect(() => {
    if (namespace === namespaceId) return;
    setNamespace(namespaceId);
  }, [namespaceId, namespace, setNamespace]);

  return (
    <Routes>
      {/* extensibility routes should go first, so if someone overwrites the default view, the new one should have a higher priority */}
      {extensions?.map(cr => createExtensibilityRoutes(cr, language))}
      {resourceRoutesNamespaced}
      {otherRoutesNamespaced}
    </Routes>
  );
}
