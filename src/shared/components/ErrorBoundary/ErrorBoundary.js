import React from 'react';
import { Bar, Button } from '@ui5/webcomponents-react';
import { useTranslation } from 'react-i18next';
import * as Sentry from '@sentry/react';

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

  componentDidCatch(error) {
    Sentry.captureException(error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <>
          <div
            role="alert"
            style={{
              width: '90vh',
              height: '70vh',
            }}
            className="sap-margin-medium"
          >
            <p className="bsl-color--text sap-margin-top-small sap-margin-bottom-small">
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
            <Bar
              design="Footer"
              endContent={
                <Button onClick={this.props.onClose}>
                  {this.props.t('common.buttons.close')}
                </Button>
              }
            />
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
