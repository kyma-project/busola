import { useState, useEffect } from 'react';
import { useTranslation, TFunction } from 'react-i18next';
import jsyaml from 'js-yaml';

const BUSOLA_GITHUB_LINKS = {
  REPOSITORY: 'https://github.com/kyma-project/busola',
  PULLS: 'https://github.com/kyma-project/busola/pull',
  COMMITS: 'https://github.com/kyma-project/busola/commit',
};
const DEV_VERSION = 'dev';

function createGithubLink(version: string): string {
  const unknownVersion = 'Unknown';

  if (version !== DEV_VERSION && version !== unknownVersion) {
    if (version.startsWith('PR-')) {
      return `${BUSOLA_GITHUB_LINKS.PULLS}/${version.slice(3)}`;
    }

    return `${BUSOLA_GITHUB_LINKS.COMMITS}/${version}`;
  }

  return BUSOLA_GITHUB_LINKS.REPOSITORY;
}

async function getBusolaVersion(t: TFunction): Promise<string> {
  if (process.env.NODE_ENV === 'development') return DEV_VERSION;

  return await fetch('assets/version.yaml')
    .then(response => {
      return response.text();
    })
    .then(text => {
      const versionFile = jsyaml.load(text) as Record<string, string>;
      return versionFile.version;
    })
    .catch(() => t('common.statuses.unknown'));
}

type BusolaVersionDetails = {
  githubLink: string;
  busolaVersion: string;
};

export const useGetBusolaVersionDetails = (): BusolaVersionDetails => {
  const [versionDetails, setVersionDetails] = useState<BusolaVersionDetails>({
    githubLink: '',
    busolaVersion: '',
  });
  const { t } = useTranslation();

  useEffect(() => {
    const getVersion = async () => {
      const busolaVersion = await getBusolaVersion(t);
      const githubLink = createGithubLink(busolaVersion);

      setVersionDetails({
        busolaVersion,
        githubLink,
      });
    };

    void getVersion();
  }, [t]);

  return versionDetails;
};
