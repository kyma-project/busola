const { expressjwt } = require('express-jwt');
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
  const { config } = global.config.features?.JWT_CHECK_CONFIG || {};

  if (process.env.PRODUCTION) {
    app.use(jwtCheck(config));
  }
}
