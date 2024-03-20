import { CopiableText } from 'shared/components/CopiableText/CopiableText';
import { ExternalLink } from 'shared/components/ExternalLink/ExternalLink';
import { ReactNode } from 'react';

export type LinkProps = {
  url: string;
  textToCopy?: string;
  iconOnly?: boolean;
  buttonText?: string;
  children?: ReactNode;
};

export const CopiableLink = (props: LinkProps) => {
  return (
    <CopiableText textToCopy={props.url}>
      <ExternalLink {...props} />
    </CopiableText>
  );
};
