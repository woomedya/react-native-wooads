import * as storeUtil from 'jutore';
import opts from '../config';

var store = storeUtil.setScope('nodemodules_wooads', {
    value: opts.enable
});

export const setAdsEnable = (value) => {
    store.set('value', value);
}

export const getAdsEnable = () => {
    return store.get('value') || opts.enable;
}

export default store;