import { useEffect, useState } from 'react';

export default function useDateNow(refreshInterval: number = 1_000) {
  const [time, setTime] = useState(() => Date.now());
  useEffect(() => {
    const handler = () => {
      const timeNow = Date.now();
      setTime(timeNow);
    };
    const interval = setInterval(handler, refreshInterval);
    return () => clearInterval(interval);
  });
  return time;
}
