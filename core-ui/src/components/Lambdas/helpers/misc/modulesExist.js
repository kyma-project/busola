export function modulesExist(existingCrds = [], modules = []) {
  if (!existingCrds.length || !modules.length) {
    return false;
  }

  for (const module of modules) {
    const moduleExist = existingCrds.some(existingCrds =>
      existingCrds.includes(module),
    );
    if (!moduleExist) {
      return false;
    }
  }

  return true;
}
