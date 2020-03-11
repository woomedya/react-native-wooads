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

export var interstitialVisible = false;

export const setInterstitialShowable = (value) => {
    interstitialShowable = value;
}

export const interstitial = () => {
    if (interstitialAvaible && config.admobInterstitialAppID) {
        interstitialAvaible = false;

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

        interstitialAvaible = true;
    }
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

