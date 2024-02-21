import { Button, Popover, Text } from '@ui5/webcomponents-react';
import { createPortal } from 'react-dom';

export function HintButton({
  setShowTitleDescription,
  showTitleDescription,
  description,
  style,
  context,
}) {
  return (
    <>
      <Button
        id={`descriptionOpener-${context}`}
        icon="hint"
        design="Transparent"
        style={style}
        onClick={() => {
          setShowTitleDescription(true);
        }}
      />
      {createPortal(
        <Popover
          opener={`descriptionOpener-${context}`}
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
