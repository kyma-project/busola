import { Warning } from 'shared/hooks/useValidateResourceBySchema/useValidateResourceBySchema';
import { ValidationSchema } from 'state/validationSchemasAtom';

export type ScanResult = {
  cluster: {
    warnings: Warning[];
  };
  namespaces: {
    [name: string]: {
      warnings: Warning[];
    };
  };
  scanStart: Date;
  scanEnd?: Date;
  ruleset?: ValidationSchema;
  status: {
    resources: {
      type: string;
      endpoint: string;
      kind: string;
      scanned: boolean;
    }[];
  };
};
