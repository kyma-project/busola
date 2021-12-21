import React, { createContext, useContext } from 'react';
import * as ReactShared from 'react-shared';
import { Tokens } from 'shared/components/Tokens';
import { ResourceForm } from 'shared/ResourceForm';
import * as FormFields from 'shared/ResourceForm/fields';
import * as FormInputs from 'shared/ResourceForm/inputs';

export const BusolaComponentsContext = createContext({});

const CoreUIComponents = {
  Tokens, // todo?
  ResourceForm,
  FormFields,
  FormInputs,
};

export function BusolaComponentsContextProvider({ children }) {
  const value = { ReactShared, CoreUIComponents };

  return (
    <BusolaComponentsContext.Provider value={value}>
      {children}
    </BusolaComponentsContext.Provider>
  );
}

export function useBusolaComponents() {
  return useContext(BusolaComponentsContext);
}
