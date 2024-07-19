import { Button, Popover, Text } from '@ui5/webcomponents-react';
import { createPortal } from 'react-dom';
import React, { CSSProperties, ReactNode, useRef, useState } from 'react';
import { uniqueId } from 'lodash';

type HintButtonProps = {
  setShowTitleDescription: React.Dispatch<React.SetStateAction<boolean>>;
  showTitleDescription: boolean;
  description: string | ReactNode;
  style?: CSSProperties;
};

export function HintButton({
  setShowTitleDescription,
  showTitleDescription,
  description,
  style,
}: HintButtonProps) {
  const [ID] = useState(uniqueId('id-')); //todo: migrate to useID from react after upgrade to version 18+
  const descBtnRef = useRef(null);
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
          <Text className="description">{description}</Text>
        </Popover>,
        document.body,
      )}
    </>
  );
}
