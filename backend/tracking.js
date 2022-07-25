export function handleTracking(app) {
  const { isEnabled } = global.config.features?.TRACKING || {};

  if (isEnabled) {
    app.post('/backend/tracking', (req, res) => {
      const payload = JSON.parse(req.body.toString());
      console.log(
        JSON.stringify({
          ...payload,
          source: 'busola-frontend',
        }),
      );
      res.sendStatus(200);
    });
  }
}
