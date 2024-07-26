import { processTranslation } from 'shared/helpers/linkExtractor';

describe('process text with different link style', () => {
  it('Markdown style links', () => {
    //GIVEN
    const text = `Welcome to [Kyma](kyma-project.io)`;

    //WHEN
    const result = processTranslation(text);

    //THEN
    expect(result.matches).toHaveLength(1);
    expect(result.matches).toContain('(kyma-project.io)');
  });

  it('i18N variables Markdown style links', () => {
    //GIVEN
    const text = `Welcome to {{[Kyma](kyma-project.io)}}`;

    //WHEN
    const result = processTranslation(text);

    //THEN
    expect(result.matches).toHaveLength(1);
    expect(result.matches).toContain('(kyma-project.io)');
  });
  it('Ordinary link with http and https', () => {
    //GIVEN
    const text = `Welcome to https://kyma-project.io or http://sap.com`;

    //WHEN
    const result = processTranslation(text);

    //THEN
    expect(result.matches).toHaveLength(2);
    expect(result.matches).toContain('(https://kyma-project.io)');
    expect(result.matches).toContain('(http://sap.com)');
  });

  it('Different link types mixed together', () => {
    //GIVEN
    const text = `Welcome to https://kyma-project.io.
  [Here](https://kyma-project.io/#/02-get-started/01-quick-install) you can find more information about installing kyma.
  If you have any problem you can try to reach {{[community](https://pages.community.sap.com/topics/kyma)}}
  Get familiar with other product at http://sap.com`;

    //WHEN
    const result = processTranslation(text);

    //THEN
    expect(result.matches).toHaveLength(4);
    expect(result.matches).toContain('(https://kyma-project.io)');
    expect(result.matches).toContain('(http://sap.com)');
    expect(result.matches).toContain(
      '(https://kyma-project.io/#/02-get-started/01-quick-install)',
    );
    expect(result.matches).toContain(
      '(https://pages.community.sap.com/topics/kyma)',
    );
  });
});

describe('No links', () => {});
