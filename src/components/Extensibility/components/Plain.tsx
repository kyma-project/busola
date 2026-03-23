import { Widget } from './Widget';

interface PlainProps {
  structure: any;
  [key: string]: any;
}

export function Plain({ structure, ...props }: PlainProps) {
  return structure.children?.map((def: any, idx: number) => (
    <Widget structure={def} {...props} key={idx} />
  ));
}
