async function getResourcesYamls(link: string, post: Function) {
  if (!link) {
    console.error('No link provided for community resource');
    return false;
  }

  try {
    const response = await post('/modules/community-resource', { link });
    if (response?.length) {
      return response;
    }
    console.error('Empty or invalid response:', response);
    return false;
  } catch (error) {
    console.error('Error fetching data:', error);
    return false;
  }
}

export async function getAllResourcesYamls(links: string[], post: Function) {
  if (links?.length) {
    const yamlRes = await Promise.all(
      links.map(async res => {
        if (res) {
          return await getResourcesYamls(res, post);
        }
      }),
    );
    return yamlRes.flat();
  }
}
