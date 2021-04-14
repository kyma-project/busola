import React from 'react';

export function useOnBeforeUnload(initialShowMessage = true) {
  const [showMessage, setShowMessage] = React.useState(initialShowMessage);

  React.useEffect(() => {
    window.onbeforeunload = showMessage ? () => '' : null;
    return () => {
      window.onbeforeunload = null;
    };
  }, [showMessage]);

  return setShowMessage;
}
