import opts from './config';
import container from './libs/container';
import * as premiumStore from './libs/premiumstore';

export const config = ({
    serverUrl, publicKey, privateKey, applicationId, tokenTimeout,
    admobBannerAppID, admobInterstitialAppID, admobNativeAppID,
    enable
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

    if (enable != null) {
        opts.enable = enable
        premiumStore.setPremium(enable);
    }
}

export const setEnable = value => {
    opts.enable = value;
    premiumStore.setPremium(value);
}

export default container;