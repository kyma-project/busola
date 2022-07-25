import React from 'react';
import { CopiableText } from 'shared/components/CopiableText/CopiableText';
import { Link } from 'shared/components/Link/Link';

export const CopiableLink = props => {
  return (
    <CopiableText textToCopy={props.url} compact={true} i18n={props.i18n}>
      <Link className="fd-link" {...props} />
    </CopiableText>
  );
};

CopiableLink.propTypes = Link.propTypes;
