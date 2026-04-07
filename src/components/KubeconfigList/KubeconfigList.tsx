import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

export function KubeconfigList() {
  const { t } = useTranslation();
  const [files, setFiles] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/backend/kubeconfig')
      .then((res) => {
        if (!res.ok) throw new Error(res.statusText);
        return res.json();
      })
      .then(setFiles)
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div className="kubeconfig-list">
      <h1>{t('kubeconfig.list.title', 'Kubeconfig Files')}</h1>
      {error && <p className="error">{error}</p>}
      <ul>
        {files.map((file) => (
          <li key={file}>
            <a href={`/kubeconfig/${file}`} download={file}>
              {file}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
