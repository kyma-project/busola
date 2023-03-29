import { useState, useEffect } from 'react';
import { useTranslation, TFunction } from 'react-i18next';
import jsyaml from 'js-yaml';

const BUSOLA_GITHUB_LINKS = {
  REPOSITORY: 'https://github.com/kyma-project/busola',
  PULLS: 'https://github.com/kyma-project/busola/pull',
  COMMITS: 'https://github.com/kyma-project/busola/commit',
};

function createGithubLink(version: string): string {
  const unknownVersion = 'Unknown';
  const devVersion = 'dev';

  if (version !== devVersion && version !== unknownVersion) {
    if (version.toString().startsWith('PR-')) {
      return `${BUSOLA_GITHUB_LINKS.PULLS}/${version.slice(3)}`;
    } else if (version.toString().startsWith('v20')) {
      return `${BUSOLA_GITHUB_LINKS.COMMITS}/${version.substring(
        version.length - 8,
      )}`;
    }
    return `${BUSOLA_GITHUB_LINKS.COMMITS}/${version}`;
  }

  return BUSOLA_GITHUB_LINKS.REPOSITORY;
}

async function getBusolaVersion(t: TFunction): Promise<string> {
  return await fetch('/version.yaml')
    .then(response => {
      return response.text();
    })
    .then(text => {
      const versionFile = jsyaml.load(text) as Record<string, string>;
      return versionFile.version;
    })
    .catch(e => {
      console.warn(e);
      return t('common.statuses.unknown');
    });
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
