import * as storeUtil from 'jutore';
import opts from '../config';

var store = storeUtil.setScope('nodemodules_wooads', {
    value: false,
    pages: {}
});

export const setAdsEnable = (value) => {
    if (value != null && value != getAdsEnable())
        store.set('value', value);
}

export const getAdsEnable = () => {
    return store.get('value');
}

export const setPageAdsEnable = (pages) => {
    if (pages != null)
        store.set('pages', pages);
}

export const getPageAdsEnable = (pageKey) => {
    var enable = getAdsEnable();
    var pages = store.get('pages');

    return pages[pageKey] || {
        banner: enable,
        transition: enable
    };
}

export default store;