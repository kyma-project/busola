const expressjwt = require('express-jwt');
const jwks = require('jwks-rsa');

const jwtCheck = ({ issuer, jwksUri }) =>
  expressjwt({
    secret: jwks.expressJwtSecret({
      cache: true,
      rateLimit: true,
      jwksRequestsPerMinute: 5,
      jwksUri,
    }),
    issuer,
    algorithms: ['RS256'],
  });

export function setupJWTCheck(app) {
  const jwtConfig = process.env.JWT_CHECK_CONFIG;
  console.log(!!jwtConfig?.enabled);

  if (jwtConfig?.enabled) {
    app.use(
      jwtCheck({
        issuer: 'https://apskyxzcl.accounts400.ondemand.com',
        jwksUri: 'https://apskyxzcl.accounts400.ondemand.com/oauth2/certs',
      }),
    );
  }
}
