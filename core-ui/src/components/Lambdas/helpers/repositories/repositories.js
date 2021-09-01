export function isGitUrl(str) {
  var regex = /(?:git|ssh|https?|git@[-\w.]+):(\/\/)?(.*?)(\.git)(\/?|#[-\d\w._]+?)$/;
  return regex.test(str);
}
