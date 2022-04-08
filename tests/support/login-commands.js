import config from '../config';
import { loadFile } from '../support/loadFile';

const NO_VALUE = 'NO_VALUE'; // must be something, OIDC server doesn't accept empty strings
const USERNAME = Cypress.env('OIDC_USER');
const PASSWORD = Cypress.env('OIDC_PASS');

Cypress.Commands.add('loginAndSelectCluster', function(params) {
  const defaults = {
    fileName: 'kubeconfig.yaml',
    expectedLocation: /overview$/,
    storage: null,
  };
  const { fileName, expectedLocation, storage } = { ...defaults, ...params };

  cy.wrap(loadFile('kubeconfig.yaml')).then(kubeconfig => {
    if (kubeconfig.users?.[0]?.user?.exec?.args) {
      // conditionally logs in to OIDC
      const URLelement = kubeconfig.users[0].user.exec.args.find(el =>
        el.includes('oidc-issuer-url'),
      );
      // kubeconfig should only specify a scheme and a domain without the "/ui/protected/profilemanagement" part , i.e, https://apskyxzcl.accounts400.ondemand.com
      const OICD_URL = /oidc-issuer-url=(?<url>(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,}))/.exec(
        URLelement,
      )?.groups?.url;

      // validating the input
      if (!(OICD_URL && USERNAME && PASSWORD)) {
        cy.log(
          'Either OIDC url, username or password is missing. URL is obtained from kubeconfig\'s "--oidc-issuer-url" field. Credentials are provided through Cypress env variables.',
        );
      }
      cy.wrap(OICD_URL && USERNAME && PASSWORD).should('be.ok');

      cy.request(OICD_URL).then(res => {
        const cookies = res.headers?.['set-cookie'];

        const xsrfCookie = cookies?.find(el => el.includes('XSRF'));
        const xsrfToken = xsrfCookie
          ? /XSRF_COOKIE="?(?<token>.*?)"?;/.exec(xsrfCookie)?.groups?.token
          : NO_VALUE;

        const jSessionIdCookie = cookies?.find(el => el.includes('JSESSIONID'));
        const jSessionIdToken = jSessionIdCookie
          ? /JSESSIONID="?(?<token>.*?)"?;/.exec(jSessionIdCookie)?.groups
              ?.token
          : NO_VALUE;

        const body = res.body;
        const spId =
          /spid=['"](?<spid>.*?)['"]/.exec(body)?.groups?.spid || NO_VALUE;
        const authenticityToken =
          /authenticity_token.{1,10}value="(?<auth>.*?)"/.exec(body)?.groups
            ?.auth || NO_VALUE;

        cy.log('Sending OIDC auth request');
        // if a response has status different from 2xx or 3xx, test will fail
        cy.request({
          log: true,
          url: `${OICD_URL}/saml2/idp/sso`,
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Cookie: `JSESSIONID=${jSessionIdToken}; XSRF_COOKIE="${xsrfToken}"`,
          },
          body: {
            utf8: '✓',
            authenticity_token: authenticityToken,
            xsrfProtection: xsrfToken,
            method: 'GET',
            idpSSOEndpoint: `${OICD_URL}/saml2/idp/sso`,
            sp: 'sp.accounts.sap.com',
            RelayState: `${OICD_URL}/ui/protected/profilemanagement`,
            targetUrl: '',
            sourceUrl: '',
            org: '',
            spId: spId,
            spName: 'sp.accounts.sap.com',
            mobileSSOToken: '',
            tfaToken: '',
            css: '',
            passwordlessAuthnSelected: '',
            j_username: USERNAME,
            j_password: PASSWORD,
          },
        }).then(res => {
          // assuming cookies are set only for successful login attempts
          if (!res.headers?.['set-cookie']) {
            cy.log('Failed OIDC login attempt!!');
          }
          cy.wrap(res.headers?.['set-cookie']).should('be.ok');
        });
      });
    }

    cy.visit(`${config.clusterAddress}/clusters`)
      .getIframeBody()
      .contains('Connect cluster')
      .click();

    cy.getIframeBody()
      .contains('Drag your file here or click to browse your computer')
      .attachFile(fileName, { subjectType: 'drag-n-drop' });

    cy.getIframeBody()
      .contains('Next')
      .click();

    if (storage) {
      cy.getIframeBody()
        .contains(storage)
        .click();
    }

    cy.getIframeBody()
      .find('[role="dialog"]')
      .contains('button', 'Connect cluster')
      .click();

    cy.url().should('match', expectedLocation);
    cy.getIframeBody()
      .find('thead')
      .should('be.visible'); //wait for the namespaces XHR request to finish to continue running the tests. There's no <thead> while the request is pending.

    return cy.end();
  });
});
