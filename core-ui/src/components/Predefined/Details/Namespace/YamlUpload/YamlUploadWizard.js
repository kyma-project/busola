import React from 'react';
import { Wizard } from 'fundamental-react';
import { useTranslation } from 'react-i18next';

// import {
//   useCustomFormValidator,
// } from 'react-shared';

import { YamlUpload } from './YamlUpload';
import { YamlValidate } from './YamlValidate';

export function YamlUploadWizard({ yamlContent, setYamlContent, onCancel }) {
  const { t } = useTranslation();

  // const {
  //   isValid: authValid,
  //   formElementRef: authFormRef,
  //   setCustomValid,
  //   revalidate,
  // } = useCustomFormValidator();

  const updateYamlContent = yaml => {
    if (!yaml) {
      setYamlContent(null);
      return;
    }
    setYamlContent(yaml);
  };

  const onComplete = () => {
    console.log(yamlContent);
  };

  return (
    <Wizard
      onCancel={onCancel}
      onComplete={onComplete}
      navigationType="tabs"
      headerSize="md"
      contentSize="md"
      className="add-cluster-wizard"
    >
      <Wizard.Step
        title={'Add Yaml'}
        branching={!yamlContent}
        indicator="1"
        valid={!!yamlContent}
        previousLabel={t('clusters.buttons.previous-step')}
        nextLabel={t('clusters.buttons.next-step')}
      >
        <YamlUpload
          yamlContent={yamlContent}
          setYamlContent={updateYamlContent}
        />
      </Wizard.Step>

      {yamlContent && (
        <Wizard.Step
          title={t('Validate Yaml')}
          indicator="2"
          valid
          previousLabel={t('clusters.buttons.previous-step')}
          nextLabel={t('clusters.buttons.next-step')}
        >
          <YamlValidate
            yamlContent={yamlContent}
            setYamlContent={updateYamlContent}
          />
        </Wizard.Step>
      )}

      <Wizard.Step
        title={t('clusters.wizard.storage')}
        indicator="2"
        previousLabel={t('clusters.buttons.previous-step')}
        nextLabel={t('clusters.buttons.verify-and-add')}
      ></Wizard.Step>
    </Wizard>
  );
}
