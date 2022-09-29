import { useRef, useState, useEffect } from 'react';
import { validator } from '@exodus/schemasafe';

const validateResourceBySchema = async resource => {
  const schema = await import('./schemav2.json');

  const warnings = schema?.rules.reduce((accumulator, currentRule) => {
    try {
      const schemaValidator = validator(currentRule.schema);
      const result = schemaValidator(resource);

      if (!result) return [currentRule.messageOnFailure, ...accumulator];
      return [...accumulator];
    } catch {
      return [...accumulator];
    }
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
