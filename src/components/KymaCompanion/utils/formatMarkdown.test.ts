import { describe, it, expect } from 'vitest';
import {
  formatMessage,
  extractYamlContent,
  extractLink,
  findClosingDivIndex,
  extractYamlBlock,
} from './formatMarkdown';
import Markdown from 'marked-react';
import CodePanel from '../components/Chat/CodePanel/CodePanel';
import { UI5Renderer } from 'components/KymaCompanion/components/Chat/Message/markedExtension';

describe('extractYamlContent', () => {
  it('returns empty string when no code block is present', () => {
    const block = 'This is just some text without a code block.';
    const result = extractYamlContent(block);
    expect(result).toBe('');
  });

  it('extracts basic YAML content', () => {
    const block = '```\napiVersion: v1\nkind: Pod\n```';
    const result = extractYamlContent(block);
    expect(result).toBe('apiVersion: v1\nkind: Pod');
  });
});

describe('extractLink', () => {
  it('extracts link details from a valid div block', () => {
    const block = `<div class="link" link-type="navigate"> [Go to Docs](https://docs.example.com) </div>`;
    const result = extractLink(block);
    expect(result).toEqual({
      name: 'Go to Docs',
      address: 'https://docs.example.com',
      actionType: 'navigate',
    });
  });

  it('returns null if no matching div is present', () => {
    const block = 'Some plain text with no link.';
    const result = extractLink(block);
    expect(result).toBeNull();
  });

  it('returns null if div is malformed', () => {
    const block = `<div class="link" link-type="navigate"> Go to Docs (https://docs.example.com) </div>`;
    const result = extractLink(block);
    expect(result).toBeNull();
  });

  it('trims extra whitespace from captured values', () => {
    const block = `<div class="link" link-type="  navigate  ">   [  Go to Docs  ](  https://docs.example.com  )   </div>`;
    const result = extractLink(block);
    expect(result).toEqual({
      name: 'Go to Docs',
      address: 'https://docs.example.com',
      actionType: 'navigate',
    });
  });

  it('returns null if link format is incomplete', () => {
    const block = `<div class="link" link-type="navigate"> [Go to Docs] </div>`;
    const result = extractLink(block);
    expect(result).toBeNull();
  });

  it('returns object even if name or address are empty', () => {
    const block = `<div class="link" link-type="open"> [](https://example.com) </div>`;
    const result = extractLink(block);
    expect(result).toEqual({
      name: '',
      address: 'https://example.com',
      actionType: 'open',
    });
  });
});

describe('findClosingDivIndex', () => {
  it('finds the index of the closing </div> for a single <div>', () => {
    const lines = ['<div>', '  some content', '</div>', 'after'];
    const result = findClosingDivIndex(lines, 0);
    expect(result).toBe(2);
  });

  it('handles nested <div>s correctly', () => {
    const lines = ['<div>', '  <div>', '    content', '  </div>', '</div>'];
    const result = findClosingDivIndex(lines, 0);
    expect(result).toBe(4);
  });

  it('returns -1 if closing </div> is missing', () => {
    const lines = [
      '<div>',
      '  <div>',
      '    still open',
      '  </div>',
      // missing </div>
    ];
    const result = findClosingDivIndex(lines, 0);
    expect(result).toBe(-1);
  });

  it('returns the correct index when starting from a nested div', () => {
    const lines = ['<div>', '  <div>', '    content', '  </div>', '</div>'];
    const result = findClosingDivIndex(lines, 1);
    expect(result).toBe(3);
  });

  it('returns -1 if no <div> is found at start index', () => {
    const lines = ['just text', 'more text', '</div>'];
    const result = findClosingDivIndex(lines, 0);
    expect(result).toBe(-1);
  });
});

describe('extractYamlBlocks', () => {
  it('extracts YAML content and link from a valid div block', () => {
    const text =
      '<div class="yaml-block>\n<div class="yaml">\n```yaml\napiVersion: v1\nkind: Pod\n```\n</div>\n<div class="link" link-type="Update">\n[Apply](/namespaces/test/Pod)\n</div>\n</div>\n';
    const lines = text.split('\n');

    const result = extractYamlBlock(lines, 0);
    expect(result.content).toEqual('yaml\napiVersion: v1\nkind: Pod');
    expect(result.link).toEqual({
      name: 'Apply',
      address: '/namespaces/test/Pod',
      actionType: 'Update',
    });
    expect(result.end).toEqual(10);
  });
});

describe('formatMessage', () => {
  it('formats plain markdown text', () => {
    const text = 'Hello, **world**!';
    const themeClass = 'light';
    const result = formatMessage(text, themeClass);

    expect(result).toHaveLength(1);
    const div = result[0];
    expect(div.type).toBe('div');
    expect(div.props.className).toBe('light');
    const markdown = div.props.children;
    expect(markdown.type).toBe(Markdown);
    expect(markdown.props.renderer).toBe(UI5Renderer);
    expect(markdown.props.children).toBe('Hello, **world**!');
  });

  it('formats YAML block without link', () => {
    const text = `
<div class="yaml-block">
\`\`\`yaml
apiVersion: v1
kind: Pod
\`\`\`
</div>
    `.trim();
    const themeClass = 'dark';
    const result = formatMessage(text, themeClass);

    expect(result).toHaveLength(1);
    const div = result[0];
    expect(div.type).toBe('div');
    expect(div.props.className).toBe('dark');
    const codePanel = div.props.children;
    expect(codePanel.type).toBe(CodePanel);
    expect(codePanel.props).toEqual({
      withAction: true,
      language: 'yaml',
      code: 'apiVersion: v1\nkind: Pod',
      link: null,
    });
  });

  it('formats YAML block with link', () => {
    const text = `
<div class="yaml-block">
\`\`\`yaml
apiVersion: v1
kind: Pod
\`\`\`
<div class="link" link-type="Update">[Update Pod](http://example.com)</div>
</div>
    `.trim();
    const themeClass = 'dark';
    const result = formatMessage(text, themeClass);

    expect(result).toHaveLength(1);
    const div = result[0];
    expect(div.type).toBe('div');
    expect(div.props.className).toBe('dark');
    const codePanel = div.props.children;
    expect(codePanel.type).toBe(CodePanel);
    expect(codePanel.props).toEqual({
      withAction: true,
      language: 'yaml',
      code: 'apiVersion: v1\nkind: Pod',
      link: {
        name: 'Update Pod',
        address: 'http://example.com',
        actionType: 'Update',
      },
    });
  });

  it('formats mixed content', () => {
    const text = `
This is some text before.

<div class="yaml-block">
\`\`\`yaml
apiVersion: v1
kind: Pod
\`\`\`
</div>

And some text after.
    `.trim();
    const themeClass = 'light';
    const result = formatMessage(text, themeClass);

    expect(result).toHaveLength(3);

    // First part: markdown text
    const div1 = result[0];
    expect(div1.type).toBe('div');
    expect(div1.props.className).toBe('light');
    const markdown1 = div1.props.children;
    expect(markdown1.type).toBe(Markdown);
    expect(markdown1.props.renderer).toBe(UI5Renderer);
    expect(markdown1.props.children).toBe('This is some text before.\n');

    // Second part: YAML block
    const div2 = result[1];
    expect(div2.type).toBe('div');
    expect(div2.props.className).toBe('light');
    const codePanel = div2.props.children;
    expect(codePanel.type).toBe(CodePanel);
    expect(codePanel.props).toEqual({
      withAction: true,
      language: 'yaml',
      code: 'apiVersion: v1\nkind: Pod',
      link: null,
    });

    // Third part: markdown text
    const div3 = result[2];
    expect(div3.type).toBe('div');
    expect(div3.props.className).toBe('light');
    const markdown2 = div3.props.children;
    expect(markdown2.type).toBe(Markdown);
    expect(markdown2.props.renderer).toBe(UI5Renderer);
    expect(markdown2.props.children).toBe('And some text after.');
  });

  it('handles empty string', () => {
    const text = '';
    const themeClass = 'light';
    const result = formatMessage(text, themeClass);

    expect(result).toHaveLength(0);
  });
});
