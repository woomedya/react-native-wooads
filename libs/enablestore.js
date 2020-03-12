import * as storeUtil from 'jutore';
import opts from '../config';

var store = storeUtil.setScope('nodemodules_wooads', {
    value: true
});

export const setAdsEnable = (value) => {
    store.set('value', value == null ? true : value);
}

export const getAdsEnable = () => {
    return store.get('value');
}

export default store;