export const nameLocaleSort = (a, b) => {
  return a.metadata.name.localeCompare(b.metadata.name);
};

export const timeSort = (a, b) => {
  return (
    new Date(b.metadata.creationTimestamp).getTime() -
    new Date(a.metadata.creationTimestamp).getTime()
  );
};
