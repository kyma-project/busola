import { Button, Popover, Text } from '@ui5/webcomponents-react';
import { createPortal } from 'react-dom';
import { useRef, useState } from 'react';
import { uniqueId } from 'lodash';

export function HintButton({
  setShowTitleDescription,
  showTitleDescription,
  description,
  style,
  dataTestID = null,
}) {
  const [uniqueID] = useState(uniqueId('id-'));
  const descBtnRef = useRef(null);
  return (
    <>
      <Button
        id={`descriptionOpener-${uniqueID}`} //migrate to useID from react after upgrade to version 18+
        ref={descBtnRef}
        icon="hint"
        design="Transparent"
        style={style}
        onClick={e => {
          e.stopPropagation();
          setShowTitleDescription(true);
        }}
        data-testid={dataTestID}
      />
      {createPortal(
        <Popover
          opener={`descriptionOpener-${uniqueID}`}
          //Point initial focus to other component removes the focus from the link in description
          onAfterOpen={() => {
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
