export function crdsExist(existingCrds = [], crds = []) {
  if (!existingCrds.length || !crds.length) {
    return false;
  }

  for (const crd of crds) {
    const crdExists = existingCrds.some(existingCrds =>
      existingCrds.includes(crd),
    );
    if (!crdExists) {
      return false;
    }
  }

  return true;
}
