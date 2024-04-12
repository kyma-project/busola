import { Button, CheckBox, Panel } from '@ui5/webcomponents-react';
import { spacing } from '@ui5/webcomponents-react-base';
import { useTranslation } from 'react-i18next';
import { DynamicPageComponent } from 'shared/components/DynamicPageComponent/DynamicPageComponent';
import { ExternalLink } from 'shared/components/ExternalLink/ExternalLink';
import { useGet } from 'shared/hooks/BackendAPI/useGet';

import { ResourceForm } from 'shared/ResourceForm';
import { Dropdown } from 'shared/ResourceForm/inputs';

import './KymaModulesAddModule.scss';
import { UI5Panel } from 'shared/components/UI5Panel/UI5Panel';
import { useRecoilState } from 'recoil';
import { columnLayoutState } from 'state/columnLayoutAtom';

export default function KymaModulesAddModule({ resource, ...props }) {
  const { t } = useTranslation();
  const [layoutState, setLayoutColumn] = useRecoilState(columnLayoutState);
  const modulesResourceUrl = `/apis/operator.kyma-project.io/v1beta2/moduletemplates`;

  const { data: modules } = useGet(modulesResourceUrl, {
    pollingInterval: 3000,
  });

  const modulesData = modules?.items.map(module => {});

  return (
    <DynamicPageComponent
      title={t('kyma-modules.add-module')}
      actions={
        <>
          {layoutState.layout !== 'MidColumnFullScreen' ? (
            <Button
              aria-label="full-screen"
              design="Transparent"
              icon="full-screen"
              onClick={() => {
                setLayoutColumn({
                  ...layoutState,
                  layout: 'MidColumnFullScreen',
                });
              }}
            />
          ) : (
            <Button
              aria-label="close-full-screen"
              design="Transparent"
              icon="exit-full-screen"
              onClick={() => {
                setLayoutColumn({
                  ...layoutState,
                  layout: 'TwoColumnsMidExpanded',
                });
              }}
            />
          )}
          <Button
            aria-label="close-column"
            design="Transparent"
            icon="decline"
            onClick={() => {
              setLayoutColumn({
                ...layoutState,
                midColumn: null,
                layout: 'OneColumn',
                showCreate: null,
              });
            }}
          />
        </>
      }
      content={
        <UI5Panel title="Modules">
          <>
            {modules?.items.map(module => {
              return (
                <div className="gridbox">
                  <div></div>
                  <CheckBox
                    style={spacing.sapUiSmallMarginTop}
                    // checked={isChecked}
                    // onChange={e => {
                    //   setCheckbox(
                    //     value,
                    //     'name',
                    //     name,
                    //     e.target.checked,
                    //     resource?.spec?.modules
                    //       ? resource?.spec?.modules.findIndex(module => {
                    //           return module.name === name;
                    //         })
                    //       : index,
                    //   );
                    // }}
                    text={module.metadata.name}
                  />
                  <Dropdown
                    style={spacing.sapUiTinyMarginTop}
                    label={t(
                      'extensibility.widgets.modules.module-channel-label',
                    )}
                    // disabled={!isChecked}
                    placeholder={t(
                      'extensibility.widgets.modules.module-channel-placeholder',
                    )}
                    options={{
                      text: `${module.spec.channel}`,
                      key: module.spec.channel,
                    }}
                    // selectedKey={
                    //   resource?.spec?.modules
                    //     ? resource?.spec?.modules[
                    //         resource?.spec?.modules.findIndex(module => {
                    //           return module.name === name;
                    //         })
                    //       ]?.channel
                    //     : ''
                    // }
                    // onSelect={(_, selected) => {
                    //   if (selected.key !== -1) {
                    //     onChange({
                    //       storeKeys: storeKeys
                    //         .push(
                    //           resource?.spec?.modules
                    //             ? resource?.spec?.modules.findIndex(module => {
                    //                 return module.name === name;
                    //               })
                    //             : index,
                    //         )
                    //         .push('channel'),
                    //       scopes: ['value'],
                    //       type: 'set',
                    //       schema,
                    //       data: { value: selected.key },
                    //       required,
                    //     });
                    //   }
                    // }}
                  />

                  {module.metadata.annotations[
                    'operator.kyma-project.io/doc-url'
                  ] ? (
                    <ExternalLink
                      url={
                        module.metadata.annotations[
                          'operator.kyma-project.io/doc-url'
                        ]
                      }
                      iconStyle={spacing.sapUiMediumMarginTop}
                    >
                      {t('extensibility.widgets.modules.documentation')}
                    </ExternalLink>
                  ) : null}
                </div>
              );
            })}
          </>
          {/* {parsedOptions?.betaAlert && isBeta && isChecked ? (
              <MessageStrip
                design="Warning"
                hideCloseButton
                className="alert"
                style={spacing.sapUiSmallMarginTopBottom}
              >
                {tExt(parsedOptions?.betaAlert)}
              </MessageStrip>
            ) : null} */}
        </UI5Panel>
      }
    >
      {' '}
    </DynamicPageComponent>
  );
}
