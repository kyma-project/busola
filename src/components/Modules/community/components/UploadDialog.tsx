import {
  State,
  UploadState,
} from 'components/Modules/community/components/uploadStateAtom';
import {
  BusyIndicator,
  Button,
  FlexBox,
  List,
  ListItemCustom,
  MessageBox,
  ObjectStatus,
  Text,
} from '@ui5/webcomponents-react';
import { FlexBoxDirection } from '@ui5/webcomponents-react/dist/enums/FlexBoxDirection';
import { FlexBoxJustifyContent } from '@ui5/webcomponents-react/dist/enums/FlexBoxJustifyContent';
import { useTranslation } from 'react-i18next';

export type UploadDialogProps = {
  state?: UploadState[] | null;
};

function renderState(state: State) {
  switch (state) {
    case State.Finished:
      return <ObjectStatus showDefaultIcon state={'Positive'} />;
    case State.Error:
      return <ObjectStatus showDefaultIcon state={'Negative'} />;
    default:
      return <BusyIndicator active />;
  }
}

export default function UploadDialog({ state }: UploadDialogProps) {
  const { t } = useTranslation();
  if (!state) {
    return <></>;
  }
  console.log(state);

  return (
    <MessageBox
      open
      style={{
        width: '500px',
        height: '350px',
      }}
      actions={[
        <Button key="ok" design="Attention">
          {t('common.buttons.ok')}
        </Button>,
      ]}
    >
      <FlexBox direction={FlexBoxDirection.Column}>
        <Text>INSTALATION STATUS</Text>
        {state.map((moduleState, idx) => (
          <List id={`${moduleState.moduleName}-${idx}`}>
            <ListItemCustom>
              <FlexBox
                justifyContent={FlexBoxJustifyContent.SpaceAround}
                fitContainer
              >
                <Text>{moduleState.moduleName}</Text>
                <Text>{moduleState.state}</Text>
                {renderState(moduleState.state)}
              </FlexBox>
            </ListItemCustom>
          </List>
        ))}
      </FlexBox>
    </MessageBox>
  );
}
