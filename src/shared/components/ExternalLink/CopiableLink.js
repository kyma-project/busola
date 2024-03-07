import { CopiableText } from 'shared/components/CopiableText/CopiableText';
import { ExternalLink } from 'shared/components/ExternalLink/ExternalLink';

export const CopiableLink = props => {
  return (
    <CopiableText textToCopy={props.url}>
      <ExternalLink {...props} />
    </CopiableText>
  );
};

CopiableLink.propTypes = ExternalLink.propTypes;
