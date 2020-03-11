import opts from './config';
import container from './libs/container';

export const config = ({
    serverUrl, publicKey, privateKey, applicationId, tokenTimeout,
    admobBannerAppID, admobInterstitialAppID, admobNativeAppID
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
}

export default container;