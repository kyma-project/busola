import { useRecoilValue } from 'recoil';
import { widgetsState } from 'state/navigation/extensionsAtom';

export const useGetWidget = destination => {
  const widgets = useRecoilValue(widgetsState);
  console.log('lolo destination', destination, widgets);
  const resource = widgets.find(el => {
    console.log('lolo el', el, destination);
    return el.widget.destination === destination;
  });

  return resource;
};
