import { saveInitParams } from './../init-params';

export const communication = {
  customMessagesListeners: {
    'busola.setInitParams': ({ params }) => {
      saveInitParams(params);
      location.reload();
    },
  },
};
