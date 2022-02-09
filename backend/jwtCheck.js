const fs = require('fs');
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
  console.log('start setup');
  try {
    console.log('fse', fs.existsSync('./config/config.json'));
    const a = JSON.parse(fs.readFileSync('./config/config.json'));
    console.log(a);
    const jwtConfig = a.config.features.JWT_CHECK_CONFIG;
    console.log('config', jwtConfig);
    if (jwtConfig.isEnabled) {
      app.use(jwtCheck(jwtConfig.config));
      console.log('done');
    }
  } catch (e) {
    console.log(e);
  }
}
