import opts from './config';
import container from './libs/container';
import * as enableStore from './libs/enablestore';

export const config = ({
    serverUrl, publicKey, privateKey, applicationId, tokenTimeout,
    admobBannerAppID, admobInterstitialAppID, admobNativeAppID,
    enable, pages
}) => {
    opts.serverUrl = serverUrl;
    opts.publicKey = publicKey;
    opts.privateKey = privateKey;
    opts.applicationId = applicationId;

    opts.admobBannerAppID = admobBannerAppID;
    opts.admobInterstitialAppID = admobInterstitialAppID;
    opts.admobNativeAppID = admobNativeAppID;

    if (tokenTimeout != null)
        opts.tokenTimeout = tokenTimeout;

    enableStore.setPageAdsEnable(pages);
    enableStore.setAdsEnable(enable);
}

export const setEnable = value => {
    enableStore.setAdsEnable(value);
}

export const setPageEnable = pages => {
    enableStore.setPageAdsEnable(pages);
}

export default container;