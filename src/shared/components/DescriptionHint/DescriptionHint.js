import { Button, Popover, Text } from '@ui5/webcomponents-react';
import { createPortal } from 'react-dom';
import React from 'react';

function HintButton({
  setShowTitleDescription,
  showTitleDescription,
  description,
  style,
}) {
  return (
    <>
      <Button
        id="descriptionOpener"
        icon="hint"
        design="Transparent"
        style={style}
        onClick={() => {
          setShowTitleDescription(true);
        }}
      />
      {createPortal(
        <Popover
          opener="descriptionOpener"
          open={showTitleDescription}
          onAfterClose={() => setShowTitleDescription(false)}
          placementType="Right"
        >
          <Text className="description">{description}</Text>
        </Popover>,
        document.body,
      )}
    </>
  );
}
