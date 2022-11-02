import React from 'react';
import { Button } from 'fundamental-react';
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

  componentDidCatch(error, errorInfo) {
    Sentry.captureException(error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div role="alert">
          <p className="fd-margin-top-bottom--sm">
            {this.props.customMessage ||
              this.props.t('err-boundary.restored-initial-form')}
          </p>

          <p>{this.state.error.message}</p>
          <p>{this.state.error.cause}</p>
          <p>{JSON.stringify(this.state.error)}</p>
          <p>{this.state.error}</p>
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
