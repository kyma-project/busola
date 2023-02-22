import { useRecoilValue } from 'recoil';
import { widgetsState } from 'state/navigation/extensionsAtom';

export const useGetWidgets = (destination, slot) => {
  const widgets = useRecoilValue(widgetsState);
  console.log('lolo destination', destination, widgets);
  const filteredWidgets = widgets
    .filter(el => {
      console.log('lolo el', el, destination);
      return (
        el.widget.destination === destination && el.widget.slots.includes(slot)
      );
    })
    .sort(
      (a, b) =>
        b.widget?.order - a.widget?.order ||
        a.widget.name.localeCompare(b.widget.name),
    );

  return filteredWidgets;
};
