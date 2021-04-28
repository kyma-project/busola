export function crdsExist(existingCrds = [], crds = []) {
  if (!existingCrds.length || !crds.length) {
    return false;
  }

  for (const crd of crds) {
    const crdExists = existingCrds.some(ecrd => ecrd.includes(crd));
    if (!crdExists) {
      return false;
    }
  }

  return true;
}
