import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { useAtomValue } from 'jotai';
import { authDataAtom } from './authDataAtom';
import { clusterAtom } from './clusterAtom';
import { getIntendedPath, clearIntendedPath } from './intendedPathAtom';

// Restores `intendedPath` on every auth restore, unlike `useAfterInitHook`'s
// one-shot `initDone` guard — required for same-tab re-auth after a session drop.
export function useIntendedPathRestore() {
  const authData = useAtomValue(authDataAtom);
  const cluster = useAtomValue(clusterAtom);
  const navigate = useNavigate();
  const restoredRef = useRef<string | null>(null);

  useEffect(() => {
    if (!authData || !cluster) return;
    const intended = getIntendedPath();
    if (!intended?.path) return;
    if (restoredRef.current === intended.path) return;
    restoredRef.current = intended.path;

    navigate(`/cluster/${encodeURIComponent(cluster.name)}${intended.path}`);
    clearIntendedPath();
  }, [authData, cluster, navigate]);
}
