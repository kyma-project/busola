import { communication } from './communication';
import { navigation } from './navigation';
import { settings } from '../settings';

export default {
  navigation,
  communication,
  settings,
  routing: {
    pageNotFoundHandler: () => ({ redirectTo: '/login' }),
  },
  lifecycleHooks: {
    luigiAfterInit: Luigi.ux().hideAppLoadingIndicator,
  },
};
