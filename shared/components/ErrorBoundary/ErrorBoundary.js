import React from 'react';
import { Button } from 'fundamental-react';
import { useTranslation } from 'react-i18next';

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

  render() {
    if (this.state.hasError) {
      return (
        <div role="alert">
          <p className="fd-margin-top-bottom--sm">
            {this.props.customMessage ||
              this.props.t('err-boundary.restored-initial-form')}
          </p>

          <Button
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            {this.props.t('err-boundary.go-back')}
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}

export const ErrorBoundary = ({ i18n, ...props }) => {
  const { t } = useTranslation(null, { i18n });
  return <ErrorBoundaryComponent {...props} t={t} />;
};
