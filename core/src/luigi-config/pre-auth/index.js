import { communication } from './communication';
import { navigation } from './navigation';
import { settings } from '../settings';

export default {
  navigation,
  communication,
  settings,
  lifecycleHooks: {
    luigiAfterInit: Luigi.ux().hideAppLoadingIndicator,
  },
};
