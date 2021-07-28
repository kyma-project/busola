import React from 'react';
import { CopiableText } from '../CopiableText/CopiableText';
import { Link } from './Link';

export const CopiableLink = props => {
  return (
    <CopiableText textToCopy={props.url} compact={true}>
      <Link className="fd-link" {...props} />
    </CopiableText>
  );
};

CopiableLink.propTypes = Link.propTypes;
