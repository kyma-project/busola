import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import LuigiClient from '@luigi-project/client';
import { Link } from 'fundamental-react';
import { CompassUI } from './CompassUI';
import './Compass.scss';

export const resources = [
  {
    name: 'functions',
    aliases: ['function', 'fn'],
    k8sPath: '/apis/serverless.kyma-project.io/v1alpha1',
    isNamespaced: true,
  },
  {
    name: 'pods',
    aliases: ['pod', 'po'],
    k8sPath: '/api/v1',
    isNamespaced: true,
  },
  {
    name: 'namespaces',
    aliases: ['namespace', 'ns'],
    k8sPath: '/api/v1',
    isNamespaced: false,
  },
];

export const CompassContext = createContext();

export function Suggestion({ name, url, isNamespaced }) {
  const navigate = () => {
    const context = isNamespaced ? 'namespace' : 'cluster';
    LuigiClient.linkManager()
      .fromContext(context)
      .navigate(url);
  };

  return (
    <Link className="fd-link" onClick={navigate}>
      {name}
    </Link>
  );
}

function findResourceType(resourceType) {
  return resources.find(
    r => r.name === resourceType || r.aliases.includes(resourceType),
  );
}

async function search1({ resourceType, fetch, namespace }) {
  const match = findResourceType(resourceType);
  if (!match) {
    return [];
  }

  try {
    const r = await fetch(match.k8sPath + '/' + match.name);
    let { items } = await r.json();
    if (namespace) {
      items = items.filter(
        res => !res.metadata.namespace || res.metadata.namespace === namespace,
      );
    }
    if (match.isNamespaced) {
      return items.map(res => ({
        name: `${match.aliases[0]} ${res.metadata.name} (${res.metadata.namespace})`,
        url: `/namespaces/${res.metadata.namespace}/${match.name}/details/${res.metadata.name}`,
      }));
    } else {
      return items.map(res => ({
        name: `${match.aliases[0]} ${res.metadata.name}`,
        url: `/${match.name}/${res.metadata.name}`,
      }));
    }
  } catch (e) {
    console.log(e);
    return [];
  }
}

export async function getSuggestions({ search, namespace, fetch }) {
  const tokens = search.toLowerCase().split(/\s+/);
  switch (tokens.length) {
    case 1:
      return search1({ resourceType: tokens[0], namespace, fetch });
    default:
      return [];
  }
}

export const CompassProvider = ({ children }) => {
  const [showDialog, setShowDialog] = useState(false);

  const onKeyPress = ({ key, metaKey }) => {
    if (key === 'k' && metaKey) {
      setShowDialog(showDialog => !showDialog);
    } else if (key === 'Escape') {
      setShowDialog(false);
    }
  };

  useEffect(() => {
    const keypressHandle = LuigiClient.addCustomMessageListener(
      'busola.main-frame-keypress',
      onKeyPress,
    );
    const clickHandle = LuigiClient.addCustomMessageListener(
      'busola.main-frame-click',
      () => setShowDialog(false),
    );
    return () => {
      LuigiClient.removeCustomMessageListener(keypressHandle);
      LuigiClient.removeCustomMessageListener(clickHandle);
    };
  }, []);

  const keyDown = useCallback(onKeyPress, []);

  useEffect(() => {
    window.addEventListener('keydown', keyDown);
    return () => window.removeEventListener('keydown', keyDown);
  }, []);

  return (
    <CompassContext.Provider value={null}>
      {showDialog && <CompassUI hide={() => setShowDialog(false)} />}
      {children}
    </CompassContext.Provider>
  );
};

export function useCompass() {
  return useContext(CompassContext);
}
