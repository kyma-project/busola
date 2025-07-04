import { getKcpToken } from './getKcpToken';

export class TokenManager {
  constructor() {
    this.currentToken = null;
    this.tokenExpirationTime = null;
    // Add buffer time (e.g., 5 minutes) before actual expiration to prevent edge cases
    this.expirationBuffer = 5 * 60 * 1000;
  }

  async getToken() {
    // Check if token exists and is not near expiration
    if (
      this.currentToken &&
      this.tokenExpirationTime &&
      Date.now() < this.tokenExpirationTime - this.expirationBuffer
    ) {
      return this.currentToken;
    }

    // If token doesn't exist or is expired/near expiration, fetch new token
    try {
      const newToken = await getKcpToken();
      this.currentToken = newToken;
      // Set expiration time based on JWT expiry
      // You'll need to decode the JWT to get the actual expiration
      this.tokenExpirationTime = this.getExpirationFromJWT(newToken);
      return newToken;
    } catch (error) {
      console.error('Failed to refresh token:', error);
      throw error;
    }
  }

  getExpirationFromJWT(token) {
    try {
      // Split the token and get the payload
      const PAYLOAD_INDEX = 1;
      const payload = JSON.parse(
        Buffer.from(token.split('.')[PAYLOAD_INDEX], 'base64').toString(),
      );
      // exp is in seconds, convert to milliseconds
      return payload.exp * 1000;
    } catch (error) {
      console.error('Error parsing JWT:', error);
      // If we can't parse the expiration, set a default (e.g., 1 hour from now)
      return Date.now() + 60 * 60 * 1000;
    }
  }
}
