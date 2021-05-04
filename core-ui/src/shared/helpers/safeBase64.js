export const base64Encode = str => btoa(unescape(encodeURIComponent(str)));
export const base64Decode = base64Str =>
  decodeURIComponent(escape(atob(base64Str)));
