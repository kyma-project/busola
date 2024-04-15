import { Button, FlexBox } from '@ui5/webcomponents-react';
import './Bubbles.scss';

export default function Bubbles({ suggestions, onClick, className }) {
  return (
    <FlexBox
      wrap="Wrap"
      justifyContent="Start"
      className={'bubbles-container ' + className}
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
  );
}
