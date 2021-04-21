import React, { useContext } from 'react';
import { SearchParamsContext } from '../../Logs/SearchParams.reducer';
import { Button } from 'fundamental-react';

export default function AutoRefreshButton() {
  const [{ autoRefreshEnabled }, actions] = useContext(SearchParamsContext);

  return (
    <Button
      className="link-button fd-has-margin-right-tiny fd-has-type-minus-1"
      glyph={autoRefreshEnabled ? 'media-pause' : 'media-play'}
      option="transparent"
      size="xs"
      onClick={() => actions.setAutoRefresh(!autoRefreshEnabled)}
      data-test-id="auto-refresh-button"
    >
      auto refresh
    </Button>
  );
}
