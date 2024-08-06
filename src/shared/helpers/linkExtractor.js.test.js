import { extractLinks } from 'shared/helpers/linkExtractor';

describe('process text with different link style', () => {
  it('Markdown style links', () => {
    //GIVEN
    const text = `Welcome to [Kyma](kyma-project.io)`;

    //WHEN
    const result = extractLinks(text);

    //THEN
    expect(result).toHaveLength(1);
    expect(result).toContainEqual({
      matchedText: '[Kyma](kyma-project.io)',
      url: 'kyma-project.io',
      urlText: 'Kyma',
    });
  });

  it('i18N variables Markdown style links', () => {
    //GIVEN
    const text = `Welcome to {{[Kyma](kyma-project.io)}}`;

    //WHEN
    const result = extractLinks(text);

    //THEN
    expect(result).toHaveLength(1);
    expect(result).toContainEqual({
      matchedText: '{{[Kyma](kyma-project.io)}}',
      url: 'kyma-project.io',
      urlText: 'Kyma',
    });
  });

  it('Ordinary link with http and https', () => {
    //GIVEN
    const text = `Welcome to https://kyma-project.io or http://sap.com`;

    //WHEN
    const result = extractLinks(text);

    //THEN
    expect(result).toHaveLength(2);
    expect(result).toContainEqual({
      matchedText: 'https://kyma-project.io',
      url: 'https://kyma-project.io',
      urlText: 'https://kyma-project.io',
    });
    expect(result).toContainEqual({
      matchedText: 'http://sap.com',
      url: 'http://sap.com',
      urlText: 'http://sap.com',
    });
  });

  it('Different link types mixed together', () => {
    //GIVEN
    const text = `Welcome to https://kyma-project.io.
  [Here](https://kyma-project.io/#/02-get-started/01-quick-install) you can find more information about installing kyma.
  If you have any problem you can try to reach {{[community](https://pages.community.sap.com/topics/kyma)}}
  Get familiar with other product at http://sap.com`;

    //WHEN
    const result = extractLinks(text);

    //THEN
    expect(result).toHaveLength(4);
    expect(result).toContainEqual({
      matchedText: 'https://kyma-project.io',
      url: 'https://kyma-project.io',
      urlText: 'https://kyma-project.io',
    });
    expect(result).toContainEqual({
      matchedText: 'http://sap.com',
      url: 'http://sap.com',
      urlText: 'http://sap.com',
    });
    expect(result).toContainEqual({
      matchedText:
        '[Here](https://kyma-project.io/#/02-get-started/01-quick-install)',
      url: 'https://kyma-project.io/#/02-get-started/01-quick-install',
      urlText: 'Here',
    });
    expect(result).toContainEqual({
      matchedText:
        '{{[community](https://pages.community.sap.com/topics/kyma)}}',
      url: 'https://pages.community.sap.com/topics/kyma',
      urlText: 'community',
    });
  });

  it('No links in text', () => {
    //GIVEN
    const text = "This text doesn't contain any links.";

    //WHEN
    const result = extractLinks(text);

    //THEN
    expect(result).toHaveLength(0);
  });
});
