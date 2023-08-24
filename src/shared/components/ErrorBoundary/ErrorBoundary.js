import React from 'react';
import { Button } from '@ui5/webcomponents-react';
import { useTranslation } from 'react-i18next';
import * as Sentry from '@sentry/react';

import './ErrorBoundary.scss';

class ErrorBoundaryComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    Sentry.captureException(error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <>
          <div role="alert">
            <p className="fd-margin-top-bottom--sm fd-color--text">
              {this.props.customMessage ||
                this.props.t('err-boundary.restored-initial-form')}
            </p>
            {this.props.displayButton ? (
              <Button
                onClick={() => this.setState({ hasError: false, error: null })}
              >
                {this.props.t('err-boundary.go-back')}
              </Button>
            ) : (
              ''
            )}
          </div>
          {this.props.onClose ? (
            <footer
              className="fd-bar__right"
              style={{
                bottom: 0,
                position: 'absolute',
              }}
            >
              <Button onClick={this.props.onClose} className="close-button">
                {this.props.t('common.buttons.close')}
              </Button>
            </footer>
          ) : (
            ''
          )}
        </>
      );
    }
    return this.props.children;
  }
}

ErrorBoundaryComponent.defaultProps = {
  displayButton: true,
};

export const ErrorBoundary = ({ ...props }) => {
  const { t } = useTranslation();
  return <ErrorBoundaryComponent {...props} t={t} />;
};
