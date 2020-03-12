import * as storeUtil from 'jutore';
import opts from '../config';

var store = storeUtil.setScope('nodemodules_wooads', {
    premium: opts.enable
});

export const setPremium = (value) => {
    store.set('premium', value);
}

export const getPremium = () => {
    return store.get('premium');
}

export default store;