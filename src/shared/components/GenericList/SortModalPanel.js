import { useState } from 'react';
import {
  Button,
  CustomListItem,
  GroupHeaderListItem,
  List,
  RadioButton,
  Text,
} from '@ui5/webcomponents-react';
import { Modal } from '../Modal/Modal';
import { Tooltip } from '../Tooltip/Tooltip';
import { useTranslation } from 'react-i18next';
import './SortModalPanel.scss';

export const SortModalPanel = ({
  sortBy,
  sort,
  setSort,
  disabled = false,
  defaultSort,
}) => {
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

  const handleReset = () => {
    setOrder(defaultSort.order);
    setName(defaultSort.name);
  };

  return (
    <Modal
      className={'sorting-modal'}
      title={t('common.sorting.sort')}
      headerActions={
        <Button design="Transparent" onClick={handleReset}>
          {t('common.buttons.reset')}
        </Button>
      }
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
      <List
        separators="All"
        style={{ width: '100%' }}
        onItemClick={e => {
          setOrder(e?.detail?.item?.children[0]?.value);
        }}
        accessibleName="sortOrderList"
      >
        <GroupHeaderListItem>
          {t('common.sorting.sort-order')}
        </GroupHeaderListItem>
        <CustomListItem>
          <RadioButton
            name="sortOrder"
            value="ASC"
            checked={order === 'ASC'}
            onChange={event => setOrder(event.target.value)}
          />
          <Text>{t('common.sorting.asc')}</Text>
        </CustomListItem>
        <CustomListItem>
          <RadioButton
            name="sortOrder"
            value="DESC"
            checked={order === 'DESC'}
            onChange={event => setOrder(event.target.value)}
          />
          <Text>{t('common.sorting.desc')}</Text>
        </CustomListItem>
      </List>
      <List
        separators="All"
        onItemClick={e => {
          setName(e?.detail?.item?.children[0]?.value);
        }}
        accessibleName="sortByList"
      >
        <GroupHeaderListItem>{t('common.sorting.sort-by')}</GroupHeaderListItem>
        {sortBy && (
          <>
            {Object.entries(sortBy).flatMap(([value]) => {
              return (
                <CustomListItem>
                  <RadioButton
                    name="sortBy"
                    value={value}
                    key={value}
                    checked={name === value}
                    onChange={event => setName(event.target.value)}
                  />
                  <Text>
                    {i18n.exists(`common.sorting.${value}`)
                      ? t(`common.sorting.${value}`)
                      : value}
                  </Text>
                </CustomListItem>
              );
            })}
          </>
        )}
      </List>
    </Modal>
  );
};
