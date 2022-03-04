import React, { Fragment } from 'react';
import Grid from 'styled-components-grid';
import { Modal } from 'react-shared';
import {
  List,
  Item,
  Bold,
  Text,
  SecretKey,
  CenterVertically,
  Button,
} from './styled';
import { useTranslation } from 'react-i18next';

function SecretDataModalWrapper(props) {
  const { i18n, t } = useTranslation();
  return <SecretDataModal i18n={i18n} {...props} t={t} />;
}

class SecretDataModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      encoded: true,
    };
  }

  toggleEncoded = () => {
    this.setState({
      encoded: !this.state.encoded,
    });
  };

  populateItems = (data, encoded) => {
    return Object.entries(data).map(([key, value]) => (
      <Grid key={key}>
        <Grid.Unit size={0.45}>
          <Item>
            <SecretKey>{key}</SecretKey>
          </Item>
        </Grid.Unit>
        <Grid.Unit size={0.55}>
          <CenterVertically>
            <Item data-e2e-id={`secret-${encoded ? 'encoded' : 'decoded'}`}>
              {encoded ? this.randomizeAsterisks(data[key]) : atob(value)}
            </Item>
          </CenterVertically>
        </Grid.Unit>
      </Grid>
    ));
  };

  randomizeAsterisks = value => {
    return '*'.repeat(Math.ceil(value.length / 10) * 4);
  };

  render() {
    const { title, data, prefix, modalOpeningComponent, i18n, t } = this.props;
    const { encoded } = this.state;

    const items = this.populateItems(data, encoded);
    const content = (
      <Fragment>
        {prefix && (
          <Text>
            All variables will be prefixed with:{' '}
            <Bold data-e2e-id="secret-prefix">'{prefix}'</Bold>.
          </Text>
        )}
        <List>{items}</List>
        <Button
          data-e2e-id={`button-${encoded ? 'decode' : 'encode'}`}
          onClick={this.toggleEncoded}
        >
          {encoded ? 'Decode' : 'Encode'}
        </Button>
      </Fragment>
    );

    return (
      <Modal
        title={title}
        modalOpeningComponent={modalOpeningComponent}
        actions={onClose => (
          <Button onClick={onClose} key="close">
            {t('common.buttons.close')}
          </Button>
        )}
        i18n={i18n}
      >
        {content}
      </Modal>
    );
  }
}

export default SecretDataModalWrapper;
