import React from 'react';
import { CopiableText } from '../CopiableText/CopiableText';
import { Link } from './Link';

export const CopiableLink = props => {
  return (
    <CopiableText textToCopy={props.url} compact={true} i18n={props.i18n}>
      <Link className="fd-link" {...props} />
    </CopiableText>
  );
};

CopiableLink.propTypes = Link.propTypes;
