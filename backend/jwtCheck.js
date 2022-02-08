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
  if (!process.env.JWT_CHECK_CONFIG) {
    return;
  }

  try {
    const jwtConfig = JSON.parse(process.env.JWT_CHECK_CONFIG);
    if (jwtConfig?.enabled) {
      app.use(jwtCheck(jwtConfig));
    }
  } catch (e) {
    console.log(e);
  }
}
