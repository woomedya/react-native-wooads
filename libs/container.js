import React, { Component } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-navigation';
import WooTransition from './wootransition';
import Admob, { interstitial, setInterstitialShowable, interstitialVisible } from './admob';
import enablestore, { getAdsEnable, getPageAdsEnable } from './enablestore';
import * as settingsRepo from './settings';

export default class WooadsContainer extends Component {
    constructor(props) {
        super(props)
        this.props = props;

        this.wooads = null;

        this.state = {
            admobVisible: false,
            enable: getAdsEnable(),
            pageEnable: getPageAdsEnable(this.props.page),
            initial: settingsRepo.getInitialSync()
        }
    }

    componentDidMount() {
        this.setInitial();

        enablestore.addListener('value', () => {
            this.setState({
                pageEnable: getPageAdsEnable(this.props.page),
                enable: getAdsEnable()
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
        if (this.state.enable && interstitialVisible == false) {
            setInterstitialShowable(this.getTransitionEnable());
            this.setState({
                admobVisible: this.getBannerEnable()
            }, () => {
                if (this.state.initial && this.wooads && this.wooads.refresh)
                    this.wooads.refresh();
            });
        }
        if (this.state.enable && interstitialVisible == true) {
            this.setState({
                admobVisible: false
            }, () => {
                if (this.state.initial && this.wooads && this.wooads.refresh)
                    this.wooads.refresh();
            });
        }

    }

    closeWooTransition = (admobInterstitial) => {
        this.setState({
            admobVisible: true
        }, () => {
            setInterstitialShowable(true);
            if (admobInterstitial) interstitial();
        });
    }

    getBannerEnable = () => {
        var pageEnable = this.state.pageEnable || {};
        return pageEnable.banner == null ? this.state.enable : pageEnable.banner;
    }

    getTransitionEnable = () => {
        var pageEnable = this.state.pageEnable || {};
        return pageEnable.transition == null ? this.state.enable : pageEnable.transition;
    }

    render() {
        return <SafeAreaView style={styles.container} forceInset={{ top: 'never' }}>

            {this.props.children}

            {
                this.state.enable ? <>
                    {this.getTransitionEnable() ? <WooTransition ref={ref => this.wooads = ref} onClose={this.closeWooTransition} initial={this.state.initial} /> : null}

                    {this.getBannerEnable() && this.state.admobVisible ? <Admob type={this.props.type || "banner"}></Admob> : null}
                </> : null
            }

        </SafeAreaView>;
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    }
});