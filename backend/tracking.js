export function handleTracking(app) {
  const { isEnabled } = global.config.features?.TRACKING || {};

  if (isEnabled) {
    app.post('/backend/tracking', (req, res) => {
      console.log('X-Log:', req.body.toString());
      res.sendStatus(200);
    });
  }
}
