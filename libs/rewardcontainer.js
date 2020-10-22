import React, { Component } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-navigation';
import WooReward from './wooreward';
import Admob, { reward, interstitialVisible } from './admob';
import enablestore, { getAdsEnable, getPageAdsEnable } from './enablestore';
import * as settingsRepo from './settings';

export default class WooadsRewardContainer extends Component {
    constructor(props) {
        super(props)
        this.props = props;

        this.WooReward = null;
    }

    refresh = async () => {
        if (this.WooReward && this.WooReward.refresh) {
            var code = await this.WooReward.refresh();
            if (code == 'ok')
                return code;
            else
                return await reward();
        } else {
            return 'fail';
        }
    }

    render() {
        return this.props.views == "safe" ?
            <View style={[styles.container, this.props.style]} forceInset={{ top: 'never' }}>

                {this.props.children}

                <WooReward
                    ref={ref => this.WooReward = ref}
                    onClose={this.closeWooReward}
                />

            </View> :
            <SafeAreaView style={[styles.container, this.props.style]} forceInset={{ top: 'never' }}>

                {this.props.children}

                <WooReward
                    ref={ref => this.WooReward = ref}
                    onClose={this.closeWooReward}
                />

            </SafeAreaView>
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    }
});