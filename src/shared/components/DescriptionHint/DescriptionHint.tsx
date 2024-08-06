import { Button, Popover, Text } from '@ui5/webcomponents-react';
import { createPortal } from 'react-dom';
import React, { CSSProperties, ReactNode, useRef, useState } from 'react';
import { uniqueId } from 'lodash';
import { createTranslationTextWithLinks } from '../../helpers/linkExtractor';
import { useTranslation } from 'react-i18next'; // this regex catch 2 things, markdown URL or normal URL

type HintButtonProps = {
  setShowTitleDescription: React.Dispatch<React.SetStateAction<boolean>>;
  showTitleDescription: boolean;
  description: string | ReactNode;
  style?: CSSProperties;
  disableLinkDetection?: boolean;
};

export function HintButton({
  setShowTitleDescription,
  showTitleDescription,
  description,
  style,
  disableLinkDetection = false,
}: HintButtonProps) {
  const [ID] = useState(uniqueId('id-')); //todo: migrate to useID from react after upgrade to version 18+
  const descBtnRef = useRef(null);
  const { t, i18n } = useTranslation();
  let desc = description;

  if (!disableLinkDetection && typeof description === 'string') {
    const result = createTranslationTextWithLinks(description, t, i18n);
    desc = result;
  }
  return (
    <>
      <Button
        id={`descriptionOpener-${ID}`}
        ref={descBtnRef}
        icon="hint"
        design="Transparent"
        style={style}
        onClick={e => {
          e.stopPropagation();
          setShowTitleDescription(true);
        }}
      />
      {createPortal(
        <Popover
          opener={`descriptionOpener-${ID}`}
          //Point initial focus to other component removes the focus from the link in description
          onAfterOpen={() => {
            // @ts-ignore
            descBtnRef.current.focus();
          }}
          open={showTitleDescription}
          onAfterClose={e => {
            e.stopPropagation();
            setShowTitleDescription(false);
          }}
          placementType="Right"
        >
          <Text className="description">{desc}</Text>
        </Popover>,
        document.body,
      )}
    </>
  );
}
