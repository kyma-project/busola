/* global process */
import { expressjwt } from 'express-jwt';
import jwks from 'jwks-rsa';
import rateLimit from 'express-rate-limit';
import config from './src/config/config';

const jwtCheck = ({ issuer, jwksUri, clientId }) =>
  expressjwt({
    secret: jwks.expressJwtSecret({
      cache: true,
      rateLimit: true,
      jwksRequestsPerMinute: 5,
      jwksUri,
    }),
    issuer,
    audience: clientId,
    algorithms: ['RS256'],
  });

const userRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 300,
  message: 'Too many requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.auth?.sub,
});

export function setupJWTCheck(app) {
  const jwtConfig = config?.features?.JWT_CHECK_CONFIG;

  if (!jwtConfig?.isEnabled || !jwtConfig?.config) {
    return;
  }

  if (process.env.JWT_CHECK_BYPASS !== 'true') {
    app.use('/backend', jwtCheck(jwtConfig.config));
    app.use('/backend', userRateLimiter);
  }
}
