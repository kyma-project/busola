import { useRecoilState, RecoilState } from 'recoil';
import { Switch } from 'fundamental-react';

export default function Toggle({
  label,
  state,
}: {
  label: string;
  state: RecoilState<any>;
}) {
  const [value, setValue] = useRecoilState(state);

  return (
    <div className="preferences-row">
      <span className="fd-has-color-status-4">{label}</span>
      <div>
        <Switch
          // TypeScript definitions are out of sync here
          // @ts-ignore
          localizedText={{ switchLabel: label }}
          className="fd-has-display-inline-block fd-margin-begin--tiny"
          checked={value}
          onChange={() => setValue(!value)}
          compact
        />
      </div>
    </div>
  );
}
