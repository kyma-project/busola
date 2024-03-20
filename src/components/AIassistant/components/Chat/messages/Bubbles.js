import { Button, FlexBox } from '@ui5/webcomponents-react';
import { useState } from 'react';
import './Bubbles.scss';

export default function Bubbles({ suggestions, onClick }) {
  const [clicked, setClicked] = useState(false);

  return clicked ? (
    <></>
  ) : (
    <FlexBox wrap="Wrap" justifyContent="Start" className="bubbles-container">
      {suggestions.map((suggestion, index) => (
        <Button
          key={index}
          design="Default"
          className="bubble-button"
          onClick={async () => {
            setClicked(true);
            const successful = await onClick(suggestion);
            setClicked(successful);
          }}
        >
          {suggestion}
        </Button>
      ))}
    </FlexBox>
  );
}
