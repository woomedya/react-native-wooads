import React, { Component } from "react";
import { View } from "react-native";
const firebase = require('react-native-firebase');
import config from '../config';


const Banner = firebase.admob.Banner;
const NativeExpress = firebase.admob.NativeExpress;
const AdRequest = firebase.admob.AdRequest;
const request = new AdRequest();
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

            const advert = firebase.admob().interstitial(config.admobInterstitialAppID);
            const AdRequest = firebase.admob.AdRequest;
            const request = new AdRequest();

            advert.loadAd(request.build());
            advert.on('onAdLoaded', () => {
                if (interstitialShowable) {
                    interstitialVisible = true;
                    advert.show();
                    setTimeout(() => {
                        interstitialVisible = false;
                    }, 4000)
                }
            });

            advert.on('onAdOpened', (error) => {
                res('ok');
            });

            advert.on('onAdFailedToLoad', (error) => {
                res('fail');
            });

            interstitialAvaible = true;
            rewardAvaible = true;
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

            const advert = firebase.admob().rewarded(config.rewardedAppID);
            const AdRequest = firebase.admob.AdRequest;
            const request = new AdRequest();

            advert.loadAd(request.build());
            advert.on('onAdLoaded', () => {
                rewardVisible = true;
                advert.show();
                setTimeout(() => {
                    rewardVisible = false;
                }, 4000)
            });

            advert.on('onRewarded', (event) => {
                if (returned) {
                    returned = false;
                    res('ok');
                }
            });

            advert.on('onAdClosed', (event) => {
                if (returned) {
                    returned = false;
                    res('closed');
                }
            });

            advert.on('onAdFailedToLoad', (error) => {
                if (returned) {
                    returned = false;
                    res('fail');
                }
            });

            interstitialAvaible = true;
            rewardAvaible = true;
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
        if (this.props.type == "banner") {
            return <Banner
                unitId={config.admobBannerAppID}
                size={'SMART_BANNER'}
                request={request.build()}
            />;
        } else if (this.props.type == "native") {
            return <NativeExpress
                size={"300x400"}
                unitId={config.admobNativeAppID}
                request={request.build()}
            />
        } else {
            return <Banner
                unitId={config.admobBannerAppID}
                size={this.props.type}
                request={request.build()}
            />;
        }
    }

    render() {
        return (
            <View style={{ alignItems: 'center' }} >
                {this.renderElement()}
            </View>
        );
    }
}

