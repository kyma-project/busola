import {
  FlexBox,
  RadioButton,
  Title,
  Button,
  Popover,
  Text,
} from '@ui5/webcomponents-react';
import { useTranslation } from 'react-i18next';
import { createPortal } from 'react-dom';
import { spacing } from '@ui5/webcomponents-react-base';
import './ChooseStorage.scss';
import { useState } from 'react';

export function ChooseStorage({ storage, setStorage }) {
  const { t } = useTranslation();
  const [showTitleDescription, setShowTitleDescription] = useState(false);
  //console.log(showTitleDescription)

  return (
    <>
      <Title level="H4">
        Storage type configuration
        <>
          <Button
            id="descriptionOpener"
            icon="hint"
            design="Transparent"
            style={spacing.sapUiTinyMargin}
            onClick={() => {
              setShowTitleDescription(true);
            }}
          />
          {createPortal(
            <Popover
              opener="descriptionOpener"
              open={showTitleDescription}
              onAfterClose={() => setShowTitleDescription(false)}
              placementType="Right"
            >
              <Text className="description">
                {'fdgfgdf' + t('clusters.storage.info')}
              </Text>
            </Popover>,
            document.body,
          )}
        </>
      </Title>
      <p className="cluster-wizard__storage-preference">Storage preference:</p>
      <FlexBox direction="Column">
        <RadioButton
          name="storage"
          value="localStorage"
          checked={storage === 'localStorage'}
          text={`${t('clusters.storage.labels.localStorage')}: ${t(
            'clusters.storage.descriptions.localStorage',
          )}`}
          onChange={event => setStorage(event.target.value)}
        />
        <RadioButton
          name="storage"
          value="sessionStorage"
          checked={storage === 'sessionStorage'}
          text={`${t('clusters.storage.labels.sessionStorage')}: ${t(
            'clusters.storage.descriptions.sessionStorage',
          )}`}
          onChange={event => setStorage(event.target.value)}
        />
        <RadioButton
          name="storage"
          value="inMemory"
          checked={storage === 'inMemory'}
          text={`${t('clusters.storage.labels.inMemory')}: ${t(
            'clusters.storage.descriptions.inMemory',
          )}`}
          onChange={event => setStorage(event.target.value)}
        />
      </FlexBox>
    </>
  );
}
