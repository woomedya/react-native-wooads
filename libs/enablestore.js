import * as storeUtil from 'jutore';
import opts from '../config';

var store = storeUtil.setScope('nodemodules_wooads', {
    value: false
});

export const setAdsEnable = (value) => {
    if (value != null && value != getAdsEnable())
        store.set('value', value);
}

export const getAdsEnable = () => {
    return store.get('value');
}

export default store;