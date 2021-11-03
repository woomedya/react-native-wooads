import React, { Component } from 'react';
import { StyleSheet, View } from 'react-native';
import WooTransition from './wootransition';
import { Banner as AdmobBanner, interstitial, setInterstitialShowable } from './admob';
import enablestore, { getAdsEnable, getPageAdsEnable } from './enablestore';
import * as settingsRepo from './settings';
import WooBanner from './woobanner';

export default class WooadsContainer extends Component {
    constructor(props) {
        super(props)
        this.props = props;

        this.WooTransition = null;

        this.state = {
            bannerVisible: false,
            transitionShowed: false,
            enable: getAdsEnable(),
            pageEnable: getPageAdsEnable(this.props.page),
            initial: settingsRepo.getInitialSync(),
            admobBannerVisible: false,
            admobBannerError: false
        }
    }

    componentDidMount() {
        this.setInitial();

        enablestore.addListener('value', () => {
            this.setState({
                pageEnable: getPageAdsEnable(this.props.page),
                enable: getAdsEnable(),
            }, this.refresh);
        });
    }

    setInitial = async () => {
        if (this.state.initial == false) {
            var initial = await settingsRepo.getInitial();
            this.setState({
                initial
            }, () => {
                if (initial) this.refresh();
            });
        } else {
            this.refresh();
        }
    }

    refresh = async () => {
        if (this.state.enable) {
            setInterstitialShowable(this.getTransitionEnable());
            this.setState({
                bannerVisible: this.getBannerEnable()
            }, () => {
                if (this.state.initial && this.WooTransition && this.WooTransition.refresh)
                    this.WooTransition.refresh();
            });
        }
    }

    closeWooTransition = (admobInterstitial) => {
        setInterstitialShowable(true);
        let admobEnable = this.getAdmobTransitionEnable();
        if (admobInterstitial && admobEnable) interstitial();
    }

    closeWooBanner = (admobBanner) => {
        this.setState({
            admobBannerVisible: admobBanner || false,
            admobBannerError: false
        });
    }

    getBannerEnable = () => {
        var pageEnable = this.state.pageEnable || {};
        return pageEnable.banner == null ? this.state.enable : pageEnable.banner;
    }

    getAdmobBannerEnable = () => {
        var pageAdmobEnable = (this.state.pageEnable || {}).admob || {};
        return pageAdmobEnable.banner == null ? false : pageAdmobEnable.banner;
    }

    getTransitionEnable = () => {
        var pageEnable = this.state.pageEnable || {};
        return pageEnable.transition == null ? this.state.enable : pageEnable.transition;
    }

    getAdmobTransitionEnable = () => {
        var pageAdmobEnable = (this.state.pageEnable || {}).admob || {};
        return pageAdmobEnable.transition == null ? false : pageAdmobEnable.transition;
    }

    getInfoVisibleTransition = (visible) => {
        this.setState({
            transitionShowed: visible
        });
    }

    onAdmobBannerError = (err) => {
        this.setState({
            admobBannerError: true
        });
    }

    render() {
        return <View style={[styles.container, this.props.style]} forceInset={{ top: 'never' }}>

            <View style={{ flex: 1 }}>
                {this.props.children}
            </View>

            {
                this.state.enable ? <>
                    {
                        this.getTransitionEnable() ? <WooTransition
                            ref={ref => this.WooTransition = ref}
                            onClose={this.closeWooTransition}
                            getInfoVisible={this.getInfoVisibleTransition}
                            initial={this.state.initial}
                        /> : null
                    }

                    {
                        this.getBannerEnable() && this.state.bannerVisible ?
                            (
                                this.state.admobBannerVisible ?
                                    (
                                        this.state.admobBannerError ? null :
                                            this.getAdmobBannerEnable() ?
                                                <AdmobBanner onError={this.onAdmobBannerError} type={"banner"}></AdmobBanner> : null
                                    ) :
                                    <WooBanner onClose={this.closeWooBanner} />
                            )
                            : null
                    }
                </> : null
            }

        </View>
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    }
});