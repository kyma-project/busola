import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DynamicPageComponent } from 'shared/components/DynamicPageComponent/DynamicPageComponent';
import { GenericList } from 'shared/components/GenericList/GenericList';
import './KubeconfigList.scss';

export function KubeconfigList() {
  const { t } = useTranslation();
  const [files, setFiles] = useState<string[]>([]);

  useEffect(() => {
    fetch('/backend/kubeconfig')
      .then((res) => {
        if (!res.ok) throw new Error(res.statusText);
        return res.json();
      })
      .then(setFiles)
      .catch((err) =>
        console.error('Error fetching kubeconfig files:', err.message),
      );
  }, []);

  return (
    <DynamicPageComponent
      title={t('kubeconfig.list.title', 'Kubeconfig Files')}
      content={
        <>
          <GenericList
            className="kubeconfig-list"
            entries={files.map((file) => ({ name: file }))}
            headerRenderer={() => [t('common.headers.name')]}
            rowRenderer={(entry) => {
              const nameWithoutExt = entry.name.replace(/\.(yaml|yml)$/, '');
              return [
                <a
                  key={`${entry.name}-link`}
                  href={`/kubeconfig/${nameWithoutExt}`}
                >
                  {entry.name}
                </a>,
              ];
            }}
            hasDetailsView
          />
        </>
      }
    />
  );
}
