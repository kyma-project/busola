import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';

export function KubeconfigRedirect() {
  const { name } = useParams<{ name: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    navigate(`/?kubeconfigID=${name}.yaml`, { replace: true });
  }, [name, navigate]);

  return null;
}
