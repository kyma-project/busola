import { useEffect } from 'react';
import PropTypes from 'prop-types';

export const useWebcomponents = (elementRef, eventType, handler) => {
  useEffect(() => {
    if (!elementRef || !elementRef.current) {
      console.error('No target element provided to useWebcomponentEvents');
      return;
    }
    elementRef.current.addEventListener(eventType, handler);
    return () => {
      elementRef.current.removeEventListener(eventType, handler);
    };
  }, [elementRef, handler]);
};

useWebcomponents.propTypes = {
  elementRef: PropTypes.instanceOf(Element).isRequired,
  eventsObj: PropTypes.objectOf(PropTypes.func.isRequired), // contains keys being event names (e.g. "click") and values being handlers (functions) for these events
};
