export function handleTracking(app) {
  const { isEnabled } = global.config.features?.TRACKING || {};

  if (isEnabled) {
    app.post('/backend/tracking', (req, res) => {
      const payload = JSON.parse(req.body.toString());
      console.log(
        'X-Log:',
        JSON.stringify({ ...payload, timestamp: Date.now() }),
      );
      res.sendStatus(200);
    });
  }
}
