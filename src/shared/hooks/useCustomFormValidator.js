import { useState, useRef } from 'react';

export function useCustomFormValidator() {
  const formElementRef = useRef(null);
  const [isValid, setValid] = useState(false);
  const [customValid, setCustomValid] = useState(true);

  const revalidate = (cv = customValid) => {
    setValid(
      checkFormFields(formElementRef.current) &&
        checkResourceForms(formElementRef.current),
    );
    //check not-required fields
  };

  function checkFormFields(form) {
    const formFields = form.querySelectorAll(
      'div.fd-row.form-field:not(.multi-input)',
    );
    for (let i = 0; i < formFields.length; i++) {
      const formField = formFields[i];
      const isRequired =
        formField.querySelector(
          'div.form-field > div.form-field__label > label[aria-required="true"]',
        ) !== null;
      if (!isRequired) continue;
      //Check if it has a parent and if so, if the parent is required as well
      const hasNoParent = formField.parentNode.classList.contains(
        'form-container',
      );
      const inputValid = formField.querySelector('[type]').checkValidity();
      if (hasNoParent) {
        if (!inputValid) {
          return false;
        }
        continue;
      }
      const parentRequired = formField
        .closest('div.resource-form__collapsible-section')
        .classList.contains('required');
      if (parentRequired) {
        if (!inputValid) {
          return false;
        }
        continue;
      }
    }
    return true;
  }

  function checkResourceForms(form) {
    const resourceForms = form.querySelectorAll(
      'div.resource-form__collapsible-section.required',
    );

    for (let i = 0; i < resourceForms.length; i++) {
      const content = resourceForms[i].querySelector('div.content');
      // Checks if a GenericList has at least one child
      if (content.children.length === 0) {
        return false;
      }
      // Checks if a SimpleList or KeyValuePair has at least one child
      let list = content.querySelector(
        'div.content > .multi-input, div.content > .simple-list',
      );
      if (list?.querySelectorAll('ul > li').length < 2) {
        return false;
      }
    }
    return true;
  }

  return {
    isValid,
    formElementRef,
    setCustomValid: val => {
      setCustomValid(val);
      revalidate(val);
    },
    revalidate,
  };
}
