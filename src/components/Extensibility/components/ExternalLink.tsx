import { useEffect, useMemo, useState } from 'react';
import {
  useGetPlaceholder,
  useGetTranslation,
} from 'components/Extensibility/helpers';
import { useTranslation } from 'react-i18next';
import { useJsonata } from '../hooks/useJsonata';

import { Button, Icon, Link, ToolbarButton } from '@ui5/webcomponents-react';
import { isNil } from 'lodash';

const makeHref = ({ linkObject, value }: { linkObject: any; value: any }) => {
  const [link, linkError] = linkObject;
  if (linkError) return linkError;

  let href;
  if (typeof value === 'string') {
    href =
      value.startsWith('https://') || value.startsWith('http://')
        ? value
        : `https://${value}`;
  }
  return link || href;
};

interface ExternalLinkProps {
  scope: any;
  value: any;
  structure: any;
  arrayItems: any;
  originalResource: any;
  singleRootResource: any;
  embedResource: any;
}

export const ExternalLink = ({
  scope,
  value,
  structure,
  arrayItems,
  originalResource,
  singleRootResource,
  embedResource,
}: ExternalLinkProps) => {
  const { emptyLeafPlaceholder } = useGetPlaceholder(structure);
  const { t } = useTranslation();
  const { t: tExt } = useGetTranslation();

  const stableJsonataDeps = useMemo(
    () => ({
      resource: originalResource,
      parent: singleRootResource,
      embedResource: embedResource,
      scope,
      value,
      arrayItems,
    }),
    [
      originalResource,
      singleRootResource,
      embedResource,
      scope,
      value,
      arrayItems,
    ],
  );
  const jsonata = useJsonata(stableJsonataDeps);
  const [href, setHref] = useState('');

  useEffect(() => {
    jsonata(structure.link).then((linkObject: any) => {
      setHref(makeHref({ linkObject, value }));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [structure?.link, stableJsonataDeps]);

  if (isNil(value)) return emptyLeafPlaceholder;

  if (
    structure.type === 'button' &&
    structure.targets.find((t: any) => t.slot === 'details-header')
  ) {
    return (
      <ToolbarButton
        accessibleName={tExt(value)}
        endIcon="inspect"
        onClick={() => {
          const newWindow = window.open(href, '_blank', 'noopener, noreferrer');
          if (newWindow) newWindow.opener = null;
        }}
        text={tExt(value)}
      />
    );
  }
  if (structure.type === 'button') {
    return (
      <Button
        accessibleRole="Link"
        accessibleName={tExt(value)}
        accessibleDescription="Open in new tab link"
        className="sap-margin-x-tiny"
        endIcon="inspect"
        onClick={() => {
          const newWindow = window.open(href, '_blank', 'noopener, noreferrer');
          if (newWindow) newWindow.opener = null;
        }}
      >
        {tExt(value)}
      </Button>
    );
  }

  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      accessibleName={tExt(value)}
      accessibleDescription="Open in new tab link"
    >
      {tExt(value)}
      <Icon
        design="Information"
        name="inspect"
        className="bsl-icon-s sap-margin-begin-tiny"
        accessibleName={t('common.ariaLabel.new-tab-link')}
      />
    </Link>
  );
};
ExternalLink.inline = true;
ExternalLink.copyable = true;
ExternalLink.copyFunction = (
  { value }: any,
  _: any,
  __: any,
  linkObject: any,
) => {
  return makeHref({ linkObject, value });
};
