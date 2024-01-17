import { Button, IllustratedMessage } from '@ui5/webcomponents-react';
import '@ui5/webcomponents-fiori/dist/illustrations/tnt/NoApplications.js';
import { Link } from 'shared/components/Link/Link';
import './EmptyListComponent.scss';

type EmptyListComponentProps = {
  titleText: string;
  subtitleText: string;
  buttonText: string;
  url: string;
  onClick: () => null;
};

export const EmptyListComponent = ({
  titleText,
  subtitleText,
  buttonText,
  url,
  onClick,
}: EmptyListComponentProps) => {
  return (
    <>
      <IllustratedMessage
        name="TntNoApplications"
        size="Scene"
        titleText={titleText}
        subtitle={
          <p className="emptyListComponent__subtitle">{subtitleText}</p>
        }
      >
        <div className="emptyListComponent__buttons">
          <Button design="Emphasized" onClick={onClick}>
            {buttonText}
          </Button>
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
