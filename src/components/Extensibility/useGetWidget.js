import { useRecoilValue } from 'recoil';
import { widgetsState } from 'state/navigation/extensionsAtom';

export const useGetWidgets = (location, slot) => {
  const widgets = useRecoilValue(widgetsState);
  let filteredWidgets = [];
  widgets.forEach(widget => {
    const target = widget.widget.targets.find(t => {
      return t.location === location && t.slot === slot;
    });
    if (target) {
      filteredWidgets.push({
        ...widget,
        widget: {
          ...widget.widget,
          target: target,
        },
      });
    }
  });

  filteredWidgets.sort(
    (a, b) =>
      a.widget?.order - b.widget?.order ||
      a.widget.name.localeCompare(b.widget.name),
  );

  return filteredWidgets;
};
