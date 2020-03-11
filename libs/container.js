import React, { Component } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-navigation';
import WooTransition from './wootransition';
import Admob, { interstitial, setInterstitialShowable, interstitialVisible } from './admob';

export default class WooadsContainer extends Component {
    constructor(props) {
        super(props)
        this.props = props;

        this.wooads = null;
    }

    refresh = () => {
        if (interstitialVisible == false) {
            setInterstitialShowable(false);
            this.setState({
                admobVisible: false
            }, () => {
                if (this.wooads && this.wooads.refresh) this.wooads.refresh();
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

            <WooTransition ref={ref => this.wooads = ref} onClose={this.closeWooTransition} />

            {admobVisible ? <Admob type={this.props.type || "banner"}></Admob> : null}

        </SafeAreaView>;
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    }
});