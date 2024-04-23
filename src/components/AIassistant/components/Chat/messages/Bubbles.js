import { Button, FlexBox } from '@ui5/webcomponents-react';
import './Bubbles.scss';

export default function Bubbles({ suggestions, onClick }) {
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
