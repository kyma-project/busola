import { useUpdate } from 'react-shared';
import { createPatch } from 'rfc6902';

export function useDeleteHibernationSchedule(shoot) {
  const patchRequest = useUpdate();
  const hibernation = shoot.spec.hibernation;

  return async schedule => {
    const newSchedules = hibernation.schedules.filter(
      h => JSON.stringify(h) !== JSON.stringify(schedule),
    );

    const updatedShoot = {
      ...shoot,
      spec: {
        ...shoot.spec,
        hibernation: {
          ...hibernation,
          schedules: newSchedules,
        },
      },
    };

    const url = `/apis/core.gardener.cloud/v1beta1/namespaces/${shoot.metadata.namespace}/shoots/${shoot.metadata.name}`;
    return await patchRequest(url, createPatch(shoot, updatedShoot));
  };
}
