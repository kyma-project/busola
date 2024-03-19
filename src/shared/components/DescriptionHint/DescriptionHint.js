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
        onClick={e => {
          e.stopPropagation();
          setShowTitleDescription(true);
        }}
      />
      {createPortal(
        <Popover
          opener={`descriptionOpener-${context}`}
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
