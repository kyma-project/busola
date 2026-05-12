import { useSetAtom } from 'jotai';
import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { clusterAtom } from 'state/clusterAtom';

export function KubeconfigRedirect() {
  const { name } = useParams<{ name: string }>();
  const navigate = useNavigate();
  const setCluster = useSetAtom(clusterAtom);

  useEffect(() => {
    setCluster(null);
    navigate(`/?kubeconfigID=${name}.yaml`, { replace: true });
  }, [name, navigate, setCluster]);

  return null;
}
