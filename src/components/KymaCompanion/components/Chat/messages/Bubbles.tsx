import { Button, FlexBox } from '@ui5/webcomponents-react';
import './Bubbles.scss';

interface BubblesProps {
  suggestions: any[] | undefined;
  onClick: (suggestion: string) => void;
}

export default function Bubbles({
  suggestions,
  onClick,
}: BubblesProps): JSX.Element {
  return suggestions ? (
    <FlexBox wrap="Wrap" justifyContent="Start" className={'bubbles-container'}>
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
