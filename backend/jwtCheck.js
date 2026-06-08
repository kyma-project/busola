/* global global, process */
import { expressjwt } from 'express-jwt';
import jwks from 'jwks-rsa';
import rateLimit from 'express-rate-limit';

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

const userRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 300,
  message: 'Too many requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.auth?.sub || req.ip,
});

export function setupJWTCheck(app) {
  const jwtConfig = global.config.features?.JWT_CHECK_CONFIG;

  if (!jwtConfig?.isEnabled || !jwtConfig?.config) {
    return;
  }

  if (process.env.NODE_ENV !== 'development') {
    app.use(jwtCheck(jwtConfig.config));
    app.use(userRateLimiter);
  }
}
