import React from 'react';
import { LayoutPanel } from 'fundamental-react';
import { useTranslation } from 'react-i18next';
import * as Sentry from '@sentry/react';
import { Editor } from 'shared/components/MonacoEditorESM/Editor';
import { useTheme } from 'shared/contexts/ThemeContext';

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
        <LayoutPanel className="fd-margin--md" role="alert">
          <LayoutPanel.Header>
            <LayoutPanel.Head title={this.state.error.name} />
          </LayoutPanel.Header>
          <LayoutPanel.Body
            style={{
              fontSize: '18px',
            }}
          >
            <p>{message}</p>
            {hasCause ? (
              <Editor
                editorTheme={this.props.editorTheme}
                height="10em"
                value={JSON.stringify(this.state.error.cause, null, 2)}
                autocompletionDisabled
                readOnly
              />
            ) : null}
          </LayoutPanel.Body>
        </LayoutPanel>
      );
    }

    return this.props.children;
  }
}

ExtensibilityErrBoundaryComponent.defaultProps = {
  displayButton: true,
};

export const ExtensibilityErrBoundary = ({ i18n, ...props }) => {
  const { t } = useTranslation(null, { i18n });
  const { editorTheme } = useTheme();
  return (
    <ExtensibilityErrBoundaryComponent
      {...props}
      t={t}
      editorTheme={editorTheme}
    />
  );
};
