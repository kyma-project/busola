import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from '@ui5/webcomponents-react';
import { useSetAtom } from 'jotai';
import { DynamicPageComponent } from 'shared/components/DynamicPageComponent/DynamicPageComponent';
import { GenericList } from 'shared/components/GenericList/GenericList';
import { clusterAtom } from 'state/clusterAtom';

export function KubeconfigList() {
  const { t } = useTranslation();
  const setCluster = useSetAtom(clusterAtom);
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
      title={t('clusters.kubeconfig-list.title', 'Kubeconfig Files')}
      content={
        <GenericList
          entries={files.map((file) => ({ name: file }))}
          headerRenderer={() => [t('common.headers.name')]}
          rowRenderer={(entry) => {
            const nameWithoutExt = entry.name.replace(/\.(yaml|yml)$/, '');
            return [
              <Link
                key={`${entry.name}-link`}
                wrappingType={'Normal'}
                design={'Emphasized'}
                onClick={() => setCluster(null)}
                href={`/kubeconfig/${nameWithoutExt}`}
              >
                {entry.name}
              </Link>,
            ];
          }}
          hasDetailsView
        />
      }
    />
  );
}
