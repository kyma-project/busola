import { BusyIndicator, Button, FlexBox } from '@ui5/webcomponents-react';
import './Bubbles.scss';

interface BubblesProps {
  suggestions: any[] | undefined;
  isLoading: boolean;
  onClick: (suggestion: string) => void;
}

export default function Bubbles({
  suggestions,
  isLoading,
  onClick,
}: BubblesProps): JSX.Element {
  if (isLoading) {
    return (
      <BusyIndicator
        className="ai-busy-indicator sap-margin-begin-tiny"
        active
        size="M"
        delay={0}
      />
    );
  }

  return suggestions?.length ? (
    <FlexBox
      wrap="Wrap"
      justifyContent="Start"
      className="bubbles-container sap-margin-begin-tiny sap-margin-bottom-tiny"
    >
      {suggestions.map((suggestion, index) => (
        <Button
          key={index}
          design="Default"
          className="bubble-button"
          onClick={() => onClick(suggestion)}
        >
          {suggestion}
        </Button>
      ))}
    </FlexBox>
  ) : (
    <></>
  );
}
