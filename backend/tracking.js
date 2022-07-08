export function handleTracking(app) {
  const { isEnabled } = global.config.features?.TRACKING || {};

  if (isEnabled) {
    app.post('/backend/tracking', (req, res) => {
      const payload = JSON.parse(req.body.toString());
      console.log(
        JSON.stringify({
          ...payload,
          timestamp: Date.now(),
          type: 'X-Log ' + payload.type,
        }),
      );
      res.sendStatus(200);
    });
  }
}
