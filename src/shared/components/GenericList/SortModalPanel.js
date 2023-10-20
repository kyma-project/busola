import { useState } from 'react';
import { Button, FlexBox, RadioButton } from '@ui5/webcomponents-react';
import { Modal } from '../Modal/Modal';
import { Tooltip } from '../Tooltip/Tooltip';
import { useTranslation } from 'react-i18next';

export const SortModalPanel = ({ sortBy, sort, setSort, disabled = false }) => {
  const [order, setOrder] = useState(sort.order);
  const [name, setName] = useState(sort.name);

  const { i18n, t } = useTranslation();

  const sortOpeningComponent = (
    <Tooltip content={t('common.tooltips.sort')}>
      <Button
        disabled={disabled}
        design="Transparent"
        icon="sort"
        aria-label="open-sort"
      />
    </Tooltip>
  );

  return (
    <Modal
      title={t('common.sorting.sort')}
      actions={onClose => [
        <Button
          design="Emphasized"
          onClick={() => {
            setSort({ name: name, order: order });
            onClose();
          }}
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
      <p style={{ padding: '10px' }}>{t('common.sorting.sort-order')}</p>
      <FlexBox direction="Column">
        <RadioButton
          name="sortOrder"
          value="ASC"
          checked={order === 'ASC'}
          text={t('common.sorting.asc')}
          onChange={event => setOrder(event.target.value)}
        />
        <RadioButton
          name="sortOrder"
          value="DESC"
          checked={order === 'DESC'}
          text={t('common.sorting.desc')}
          onChange={event => setOrder(event.target.value)}
        />
      </FlexBox>
      <p style={{ padding: '10px' }}>{t('common.sorting.sort-by')}</p>
      {sortBy && (
        <FlexBox direction="Column">
          {Object.entries(sortBy).flatMap(([value]) => {
            return (
              <RadioButton
                name="sortBy"
                value={value}
                checked={name === value}
                text={
                  i18n.exists(`common.sorting.${value}`)
                    ? t(`common.sorting.${value}`)
                    : value
                }
                onChange={event => setName(event.target.value)}
              />
            );
          })}
        </FlexBox>
      )}
    </Modal>
  );
};
