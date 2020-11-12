import React, { Component } from "react";
import { View } from "react-native";
import config from '../config';
import { InterstitialAd, AdEventType, RewardedAd, RewardedAdEventType, BannerAd, BannerAdSize, } from '@react-native-firebase/admob';


var interstitialAvaible = true;
var interstitialShowable = true;
var rewardAvaible = true;

export var interstitialVisible = false;
export var rewardVisible = false;

export const setInterstitialShowable = (value) => {
    interstitialShowable = value;
}

export const interstitial = async () => {
    return await new Promise(res => {
        if (interstitialAvaible && config.admobInterstitialAppID) {
            interstitialAvaible = false;
            rewardAvaible = false;
            const advert = InterstitialAd.createForAdRequest(config.admobInterstitialAppID);

            advert.load();
            advert.onAdEvent((type) => {
                if (type === AdEventType.LOADED) {
                    if (interstitialShowable) {
                        interstitialVisible = true;
                        advert.show();
                        setTimeout(() => {
                            interstitialVisible = false;
                        }, 4000)
                    }
                } else if (type === AdEventType.OPENED) {
                    res('ok');
                } else if (type === AdEventType.ERROR) {
                    res('fail');
                }

                interstitialAvaible = true;
                rewardAvaible = true;
            });

        } else {
            res('fail');
        }
    });
}

export const reward = async () => {
    return await new Promise(res => {
        if (rewardAvaible && config.rewardedAppID) {
            var returned = true;

            interstitialAvaible = false;
            rewardAvaible = false;

            const advert = RewardedAd.createForAdRequest(config.rewardedAppID);

            advert.load();
            advert.onAdEvent((type, error, reward) => {
                if (type === RewardedAdEventType.LOADED) {
                    rewardVisible = true;
                    advert.show();
                    setTimeout(() => {
                        rewardVisible = false;
                    }, 4000)
                } else if (error) {
                    if (returned) {
                        returned = false;
                        res('fail');
                    }
                } else if (type === RewardedAdEventType.EARNED_REWARD) {
                    if (returned) {
                        returned = false;
                        res('ok');
                    }
                } else if (type != AdEventType.OPENED) {
                    if (returned) {
                        returned = false;
                        res('closed');
                    }
                }

                interstitialAvaible = true;
                rewardAvaible = true;
            });
        } else {
            res('fail');
        }
    });
}

export default class Admob extends Component {
    constructor(props) {
        super(props)
        this.props = props;
    }

    renderElement() {
        return <BannerAd
            unitId={config.admobBannerAppID}
            size={BannerAdSize.SMART_BANNER}
        />

    }

    render() {
        return (
            <View style={{ alignItems: 'center' }} >
                {this.renderElement()}
            </View>
        );
    }
}

