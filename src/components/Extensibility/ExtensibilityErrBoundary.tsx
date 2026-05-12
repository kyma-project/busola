import { Component, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import * as Sentry from '@sentry/react';
import { Editor } from 'shared/components/MonacoEditorESM/Editor';
import { UI5Panel } from 'shared/components/UI5Panel/UI5Panel';
import { TFunction } from 'i18next';

type ExtensibilityErrBoundaryProps = {
  customMessage?: string;
  t: TFunction;
  children: ReactNode;
};

class ExtensibilityErrBoundaryComponent extends Component<
  ExtensibilityErrBoundaryProps,
  { hasError: boolean; error: Error | null }
> {
  constructor(props: ExtensibilityErrBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error | null) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error: Error | null) {
    Sentry.captureException(error);
  }

  render() {
    if (this.state.hasError) {
      const message = `${
        this.props.customMessage || this.props.t('extensibility.error')
      } ${this.state?.error?.message}`;

      const hasCause = this.state?.error?.cause !== undefined;

      return (
        <UI5Panel
          title={this.state?.error?.name}
          role="alert"
          accessibleName={this.props.t('components.accessible-name.error')}
        >
          <div
            style={{
              fontSize: '18px',
            }}
          >
            <p>{message}</p>
            {hasCause ? (
              <Editor
                height="10em"
                value={JSON.stringify(this.state?.error?.cause, null, 2)}
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

export const ExtensibilityErrBoundary = ({
  ...props
}: Omit<ExtensibilityErrBoundaryProps, 't'>) => {
  const { t } = useTranslation();

  return <ExtensibilityErrBoundaryComponent {...props} t={t} />;
};
