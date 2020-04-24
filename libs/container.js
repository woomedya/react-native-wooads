import React, { Component } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-navigation';
import WooTransition from './wootransition';
import Admob, { interstitial, setInterstitialShowable, interstitialVisible } from './admob';
import enablestore, { getAdsEnable } from './enablestore';
import * as settingsRepo from './settings';

export default class WooadsContainer extends Component {
    constructor(props) {
        super(props)
        this.props = props;

        this.wooads = null;
        this.banner = props.banner == null ? true : props.banner;

        this.state = {
            admobVisible: false,
            enable: getAdsEnable(),
            initial: settingsRepo.getInitialSync()
        }
    }

    componentDidMount() {
        enablestore.addListener('value', () => {
            this.setState({
                enable: getAdsEnable()
            }, this.refresh);
        });
    }

    refresh = async () => {
        if (this.state.enable && interstitialVisible == false) {
            setInterstitialShowable(false);
            this.setState({
                admobVisible: false,
                initial: await settingsRepo.getInitial()
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

    render() {
        return <SafeAreaView style={styles.container} forceInset={{ top: 'never' }}>

            {this.props.children}

            {
                this.state.enable ? <>
                    <WooTransition ref={ref => this.wooads = ref} onClose={this.closeWooTransition} initial={this.state.initial} />

                    {this.banner && this.state.admobVisible ? <Admob type={this.props.type || "banner"}></Admob> : null}
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