import { render } from '@testing-library/react';
import { CodeViewer } from '../CodeViewer';
import { ReadonlyEditorPanel } from 'shared/components/ReadonlyEditorPanel';
import { ThemeProvider } from '@ui5/webcomponents-react';

vi.mock('../../helpers', () => ({
  useGetTranslation: () => ({
    widgetT: () => 'Test Title',
  }),
}));

vi.mock('../../hooks/useJsonata', () => ({
  useJsonata: () => {
    return structure => [structure];
  },
}));

vi.mock('shared/components/MonacoEditorESM/Editor', () => ({
  Editor: vi.fn(props => <div {...props} />),
}));

vi.mock('shared/components/ReadonlyEditorPanel', async () => {
  const ReadonlyEditorPanelMock = (
    await vi.importActual('shared/components/ReadonlyEditorPanel')
  ).ReadonlyEditorPanel;
  return {
    ReadonlyEditorPanel: vi.fn(props => <ReadonlyEditorPanelMock {...props} />),
  };
});

describe('CodeViewer', () => {
  it('Renders CodeViewer component and detects yaml', () => {
    const value = {
      key: 'value',
    };

    const { container } = render(
      <ThemeProvider>
        <CodeViewer value={value} />
      </ThemeProvider>,
    );

    expect(ReadonlyEditorPanel).toHaveBeenCalledWith(
      expect.objectContaining({
        value: JSON.stringify(value, null, 2),
        editorProps: expect.objectContaining({ language: undefined }),
      }),
      {},
    );

    const editor = container.getElementsByTagName('ui5-panel');
    expect(editor).toHaveLength(1);
  });

  it('Renders CodeViewer component with a predefined language', () => {
    const value = {
      key: 'value',
    };
    const structure = { language: 'json' };

    const { container } = render(
      <ThemeProvider>
        <CodeViewer value={value} structure={structure} />
      </ThemeProvider>,
    );

    expect(ReadonlyEditorPanel).toHaveBeenCalledWith(
      expect.objectContaining({
        value: JSON.stringify(value, null, 2),
        editorProps: expect.objectContaining({ language: 'json' }),
      }),
      {},
    );

    const editor = container.getElementsByTagName('ui5-panel');
    expect(editor).toHaveLength(1);
  });

  it('Renders CodeViewer component without an empty value', () => {
    const value = null;

    const { container } = render(
      <ThemeProvider>
        <CodeViewer value={value} />
      </ThemeProvider>,
    );

    expect(ReadonlyEditorPanel).toHaveBeenCalledWith(
      expect.objectContaining({
        value: '',
      }),
      {},
    );

    const editor = container.getElementsByTagName('ui5-panel');
    expect(editor).toHaveLength(1);
  });
});
