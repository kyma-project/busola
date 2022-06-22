import { useRef, useState, useEffect } from 'react';
const { validator } = require('@exodus/schemasafe');

const validateResourceBySchema = async resource => {
  const module = await import('./schema.js');

  const warnings = module?.schema?.rules.reduce((accumulator, currentRule) => {
    const schemaValidator = validator(currentRule.schema);
    const result = schemaValidator(resource);

    if (!result) return [currentRule.messageOnFailure, ...accumulator];
    return [...accumulator];
  }, []);
  return warnings;
};

export const useValidateResourceBySchema = resource => {
  const [warnings, setWarnings] = useState(() =>
    validateResourceBySchema(resource),
  );

  const intervalRef = useRef();

  useEffect(() => {
    clearTimeout(intervalRef.current);

    intervalRef.current = setTimeout(async () => {
      const warningMessages = await validateResourceBySchema(resource);
      setWarnings(warningMessages);
    }, 500);
  }, [resource]);

  return warnings;
};
