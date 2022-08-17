import React, { useState } from 'react';
import { Button } from 'fundamental-react';
import { Modal } from '../Modal/Modal';
import { FormRadioGroup, FormRadioItem } from 'fundamental-react';
import { Tooltip } from '../Tooltip/Tooltip';
import { useTranslation } from 'react-i18next';

export const SortModalPanel = ({ sortBy, sort, setSort, disabled = false }) => {
  const [order, setOrder] = useState(sort.order);
  const [name, setName] = useState(sort.name);

  const { t } = useTranslation();

  const sortOpeningComponent = (
    <Tooltip content={t('common.tooltips.sort')}>
      <Button
        disabled={disabled}
        option="transparent"
        glyph="sort"
        aria-label="open-sort"
      />
    </Tooltip>
  );

  return (
    <Modal
      title={t('common.sorting.sort')}
      actions={onClose => [
        <Button
          option="emphasized"
          onClick={() => setSort({ name: name, order: order })}
          key="sort"
        >
          {t('common.buttons.ok')}
        </Button>,
        <Button onClick={onClose} key="cancel">
          {t('common.buttons.cancel')}
        </Button>,
      ]}
      modalOpeningComponent={sortOpeningComponent}
    >
      <p>{t('common.sorting.sort-order')}</p>
      <FormRadioGroup onChange={(_, order) => setOrder(order)}>
        <FormRadioItem
          data="ASC"
          checked={order === 'ASC'}
          // prevent error for checked without onChange
          inputProps={{ onChange: () => {} }}
        >
          {t('common.sorting.asc')}
        </FormRadioItem>
        <FormRadioItem
          data="DESC"
          checked={order === 'DESC'}
          inputProps={{ onChange: () => {} }}
        >
          {t('common.sorting.desc')}
        </FormRadioItem>
      </FormRadioGroup>

      <p>{t('common.sorting.sort-by')}</p>
      <FormRadioGroup onChange={(_, name) => setName(name)}>
        {sortBy &&
          Object.entries(sortBy).flatMap(([value]) => {
            return (
              <FormRadioItem
                data={value}
                key={value}
                checked={name === value}
                inputProps={{ onChange: () => {} }}
              >
                {t(`common.sorting.${value}`)}
              </FormRadioItem>
            );
          })}
      </FormRadioGroup>
    </Modal>
  );
};
