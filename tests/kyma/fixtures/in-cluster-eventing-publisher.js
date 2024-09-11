const axios = require('axios');

function sendEvent(type) {
  const payload = {
    source: 'kyma',
    specversion: '1.0',
    eventtypeversion: 'v1',
    datacontenttype: 'application/json',
    id: 'dummyId',
    type,
    data: '{"orderCode":"3211213"}',
  };
  console.log('Payload:', payload);
  return axios.post(
    'http://eventing-event-publisher-proxy.kyma-system/publish',
    payload,
    { headers: { 'Content-Type': 'application/cloudevents+json' } },
  );
}

module.exports = {
  main: async function(event, context) {
    try {
      const response = await sendEvent(
        'sap.kyma.custom.nonexistingapp.order.created.v1',
      );
    } catch (e) {
      console.dir(e);
    }
  },
};
