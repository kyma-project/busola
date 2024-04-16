import CryptoJS from 'crypto-js';
import Fingerprint2 from 'fingerprintjs2';

export default async function generateSessionID(authData) {
  const uuid = await generateBrowserFingerprint();
  return CryptoJS.SHA256(uuid + JSON.stringify(authData)).toString(
    CryptoJS.enc.Hex,
  );
}

const generateBrowserFingerprint = async () => {
  return await new Promise(resolve => {
    Fingerprint2.get(components => {
      const values = components.map(component => component.value);
      const fingerprint = Fingerprint2.x64hash128(values.join(''), 31);
      resolve(fingerprint);
    });
  });
};
