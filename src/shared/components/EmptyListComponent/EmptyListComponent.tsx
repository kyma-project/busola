import { Button, IllustratedMessage } from '@ui5/webcomponents-react';
import '@ui5/webcomponents-fiori/dist/illustrations/tnt/NoApplications.js';
import { Link } from 'shared/components/Link/Link';
import './EmptyListComponent.scss';

type EmptyListComponentProps = {
  titleText: string;
  subtitleText: string;
  buttonText: string;
  url: string;
};

export const EmptyListComponent = ({
  titleText,
  subtitleText,
  buttonText,
  url,
}: EmptyListComponentProps) => {
  return (
    <>
      <IllustratedMessage
        name="TntNoApplications"
        size="Scene"
        titleText={titleText}
        subtitleText={subtitleText}
      >
        <div className="emptyListComponent__buttons">
          <Button design="Emphasized">{buttonText}</Button>
          <Link
            className="emptyListComponent__link"
            text="Learn More"
            url={url}
          />
        </div>
      </IllustratedMessage>
    </>
  );
};
