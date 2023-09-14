import React from 'react';
import { useTranslation } from 'react-i18next';
import * as Sentry from '@sentry/react';
import { Editor } from 'shared/components/MonacoEditorESM/Editor';
import { UI5Panel } from 'shared/components/UI5Panel/UI5Panel';

class ExtensibilityErrBoundaryComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
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
      const message = `${this.props.customMessage ||
        this.props.t('extensibility.error')} ${this.state.error.message}`;

      const hasCause = this.state.error.cause !== undefined;

      return (
        <UI5Panel title={this.state.error.name} role="alert">
          <div
            style={{
              fontSize: '18px',
            }}
          >
            <p>{message}</p>
            {hasCause ? (
              <Editor
                height="10em"
                value={JSON.stringify(this.state.error.cause, null, 2)}
                autocompletionDisabled
                readOnly
              />
            ) : null}
          </div>
        </UI5Panel>
      );
    }

    return this.props.children;
  }
}

ExtensibilityErrBoundaryComponent.defaultProps = {
  displayButton: true,
};

export const ExtensibilityErrBoundary = ({ ...props }) => {
  const { t } = useTranslation();

  return <ExtensibilityErrBoundaryComponent {...props} t={t} />;
};
