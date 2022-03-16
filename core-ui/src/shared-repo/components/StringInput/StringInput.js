import React, { useState, useRef, useEffect } from 'react';
import classnames from 'classnames';
import { Token } from 'fundamental-react';
import { useTranslation } from 'react-i18next';

export const SingleString = ({ text, onClick, i18n }) => {
  const { t } = useTranslation(null, { i18n });
  return (
    <Token
      title={t('components.string-input.remove')}
      className="label-selector__label"
      onClick={onClick}
      buttonLabel=""
    >
      {text}
    </Token>
  );
};

export const StringInput = ({
  stringList = {},
  onChange,
  regexp = /^[A-z_-]+$/,
  required,
  placeholder = 'components.string-input.placeholder',
  compact,
  i18n,
  ...props
}) => {
  const { t } = useTranslation(null, { i18n });
  const [isValid, setValid] = useState(true);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!inputRef.current) return;
    if (typeof inputRef.current.reportValidity === 'function')
      inputRef.current.reportValidity();
  }, [isValid]);

  function handleKeyDown(e) {
    if (!isValid) {
      setValid(true);
    }
    if (e.key !== 'Enter' && e.key !== ',') return;
    handleStringEntered(e);
  }

  function handleOutOfFocus(e) {
    handleStringEntered(e);
  }

  function handleStringEntered(sourceEvent) {
    const inputValue = sourceEvent.target.value;
    if (!!required && !inputValue.length) {
      setValid(false);
      return;
    }
    if (!regexp.test(inputValue)) {
      if (inputValue) setValid(false);
      return;
    }
    sourceEvent.preventDefault();
    sourceEvent.target.value = '';

    const stringListWithoutDuplicates = stringList.filter(
      s => s !== inputValue,
    );
    onChange([...stringListWithoutDuplicates, inputValue]);
  }

  function deleteString(string) {
    onChange(stringList.filter(s => s !== string));
  }
  const inputClassName = classnames('fd-input', 'label-selector__input', {
    'fd-input--compact': compact,
  });
  return (
    <div className="fd-form-group">
      <div
        className={classnames(['label-selector', { 'is-invalid': !isValid }])}
      >
        {!!stringList.length &&
          stringList.map(s => (
            <SingleString
              key={s}
              text={s}
              onClick={() => deleteString(s)}
              i18n={i18n}
            />
          ))}
        <input
          ref={inputRef}
          className={inputClassName}
          type="text"
          placeholder={t(placeholder)}
          onKeyDown={handleKeyDown}
          onBlur={handleOutOfFocus}
          data-ignore-visual-validation
          {...props}
        />
      </div>
    </div>
  );
};
