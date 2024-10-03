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
    <Button
      disabled={disabled}
      design="Transparent"
      icon="sort"
      accessibleName="open-sort-modal"
      tooltip={t('common.tooltips.sort')}
    />
  );

  const handleReset = () => {
    setOrder(defaultSort.order);
    setName(defaultSort.name);
  };

  return (
    <Modal
      className="sorting-modal"
      title={t('common.sorting.sort')}
      headerActions={
        <Button design="Transparent" onClick={handleReset} tabIndex="-1">
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
      openerDisabled={disabled}
    >
      <List
        separators="All"
        onItemClick={e => {
          setOrder(e?.detail?.item?.children[0]?.value);
        }}
        accessibleName="sortOrderList"
      >
        <GroupHeaderListItem>
          {t('common.sorting.sort-order')}
        </GroupHeaderListItem>
        <CustomListItem selected={order === 'ASC'}>
          <RadioButton
            name="sortOrder"
            value="ASC"
            checked={order === 'ASC'}
            onChange={event => setOrder(event.target.value)}
          />
          <Text>{t('common.sorting.asc')}</Text>
        </CustomListItem>
        <CustomListItem selected={order === 'DESC'}>
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
                <CustomListItem key={value} selected={name === value}>
                  <RadioButton
                    name="sortBy"
                    value={value}
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
