import { Button, Popover, Text } from '@ui5/webcomponents-react';
import { createPortal } from 'react-dom';
import { Dispatch, JSX, ReactNode, SetStateAction, useId } from 'react';
import { createTranslationTextWithLinks } from '../../helpers/linkExtractor';
import { useTranslation } from 'react-i18next'; // this regex catch 2 things, markdown URL or normal URL

type HintButtonProps = {
  setShowTitleDescription: Dispatch<SetStateAction<boolean>>;
  showTitleDescription: boolean;
  description: string | ReactNode;
  disableLinkDetection?: boolean;
  ariaTitle?: string | JSX.Element;
  className?: string;
  id?: string;
};

export function HintButton({
  setShowTitleDescription,
  showTitleDescription,
  description,
  disableLinkDetection = false,
  ariaTitle = '',
  className,
  id,
}: HintButtonProps) {
  const ID = useId();
  const { t, i18n } = useTranslation();
  let desc = description;

  if (!disableLinkDetection && typeof description === 'string') {
    const result = createTranslationTextWithLinks(description, t, i18n);
    desc = result;
  }
  return (
    <>
      <Button
        className={className}
        id={id ?? `descriptionOpener-${ID}`}
        icon="hint"
        design="Transparent"
        onClick={(e) => {
          e.stopPropagation();
          setShowTitleDescription(true);
        }}
        accessibleName={`${ariaTitle} information`}
        tooltip={`${ariaTitle} Information`}
        style={{ pointerEvents: 'auto' }}
      />
      {createPortal(
        <Popover
          opener={`descriptionOpener-${ID}`}
          open={showTitleDescription}
          onClose={(e) => {
            e.stopPropagation();
            setShowTitleDescription(false);
          }}
          placement="End"
        >
          <Text tabIndex={-1} className="popover-description">
            {desc}
          </Text>
        </Popover>,
        document.body,
      )}
    </>
  );
}
