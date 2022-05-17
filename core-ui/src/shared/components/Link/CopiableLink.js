import React from 'react';
import { CopiableText } from 'shared/components/CopiableText/CopiableText';
import { ExternalLink } from 'shared/components/Link/ExternalLink';

export const CopiableLink = props => {
  return (
    <CopiableText textToCopy={props.url} compact={true} i18n={props.i18n}>
      <ExternalLink className="fd-link" {...props} />
    </CopiableText>
  );
};

CopiableLink.propTypes = ExternalLink.propTypes;
