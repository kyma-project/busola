import { useEffect } from 'react';
import { Routes } from 'react-router-dom';
import { useRecoilValue, useRecoilState } from 'recoil';
import { useParams } from 'react-router-dom';

import { useMicrofrontendContext } from 'shared/contexts/MicrofrontendContext';
import { languageAtom } from 'state/preferences/languageAtom';

import { resourceRoutesNamespaced } from 'resources';
import { createExtensibilityRoutes } from './ExtensibilityRoutes';
import { otherRoutesNamespaced } from 'resources/other';

import './App.scss';
import { activeNamespaceIdState } from 'state/activeNamespaceIdAtom';

export default function NamespaceRoutes() {
  const { customResources = [] } = useMicrofrontendContext();
  let { namespaceId } = useParams() || {};
  const language = useRecoilValue(languageAtom);
  const [namespace, setNamespace] = useRecoilState(activeNamespaceIdState);

  useEffect(() => {
    if (namespace === namespaceId) return;
    setNamespace(namespaceId);
  }, [namespaceId, namespace]);

  return (
    <Routes>
      {/* extensibility routes should go first, so if someone overwrites the default view, the new one should have a higher priority */}
      {customResources?.map(cr =>
        createExtensibilityRoutes(cr, language, true),
      )}
      {resourceRoutesNamespaced}
      {otherRoutesNamespaced}
    </Routes>
  );
}
