import { createStore } from '@ui-schema/ui-schema';
import { createOrderedMap } from '@ui-schema/ui-schema/Utils/createMap';
import { isPlainObject, get } from 'lodash';

function existsInTemplate(template, path) {
  if (path.length === 0) return true;
  return get(template, path) !== undefined;
}

// Recursively cleans empty strings and resulting empty objects from a resource
function cleanEmptyValuesAgainstTemplate(obj, template, path = []) {
  if (Array.isArray(obj)) {
    return obj.map((item, index) =>
      cleanEmptyValuesAgainstTemplate(item, template, [...path, index]),
    );
  }

  if (isPlainObject(obj)) {
    const cleaned = {};
    for (const [key, value] of Object.entries(obj)) {
      const currentPath = [...path, key];
      const cleanedValue = cleanEmptyValuesAgainstTemplate(
        value,
        template,
        currentPath,
      );
      const wasInTemplate = existsInTemplate(template, currentPath);

      // Skip empty strings only if the field was NOT in the template
      if (cleanedValue === '' && !wasInTemplate) continue;

      // Skip objects that are now empty only if the field was NOT in the template
      if (
        isPlainObject(cleanedValue) &&
        Object.keys(cleanedValue).length === 0 &&
        !wasInTemplate
      )
        continue;

      cleaned[key] = cleanedValue;
    }
    return cleaned;
  }

  return obj;
}

export const getResourceObjFromUIStore = (obj) => obj.valuesToJS();

export function cleanResource(resource, initialTemplate) {
  return cleanEmptyValuesAgainstTemplate(resource, initialTemplate);
}

export const getUIStoreFromResourceObj = (res) =>
  createStore(createOrderedMap(res));
