import React, { useEffect } from 'react';
import { useMicrofrontendContext } from 'shared/contexts/MicrofrontendContext';

export const Details = () => {
  const { customResources } = useMicrofrontendContext();

  console.log(customResources);
  useEffect(() => {
    async function getDetails() {}

    void getDetails();
  }, []);

  return <div>heheh</div>;
};
