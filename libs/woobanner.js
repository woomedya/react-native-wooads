import React, { Component, } from "react";
import { StyleSheet, View, Linking, Platform, StatusBar, Dimensions } from "react-native";
import Admob from './admob';
import { getApiBanner, setViewApi, setClickCountApi } from "./request";
import { color } from "./color";
import DeviceInfo from 'react-native-device-info';
import Geolocation from '@react-native-community/geolocation';
import { getCoordinate, setCoordinate } from './locationrepo';
import WebView from 'react-native-webview';

const { width, height } = Dimensions.get('window');

function stretchByDimension(cw, ch, tw, th) {
    var width = 0, height = 0;

    var wr = tw / cw;
    var hr = th / ch;
    var deger = 35 + (Platform.OS === 'android' ? StatusBar.currentHeight : 0)
    if (wr < hr) {
        width = cw * wr - deger;
        height = ch * wr - deger;
    } else {
        width = cw * hr - deger;
        height = ch * hr - deger;
    }

    return { width: cw < width ? cw : width, height: ch < height ? ch : height };
}

const reklam_wd = (aw, ah) => {
    aw = Number(aw);
    ah = Number(ah);
    var wd = stretchByDimension(aw, ah, width, height).width
    return wd;
}

const reklam_ht = (aw, ah) => {
    aw = Number(aw);
    ah = Number(ah);
    ht = stretchByDimension(aw, ah, width, height).height
    return ht;
}

export default class WooBanner extends Component {
    constructor(props) {
        super(props)
        this.props = props;

        this.webview = null;

        this.state = {
            data: {},
            ads: {},
            woo: false,
            dataDownloaded: false
        };
    }

    componentDidMount = () => {
        this.refresh();
    }

    getLocation = async () => {
        this.setLocation();
        return await getCoordinate();
    }

    setLocation = () => {
        Geolocation.getCurrentPosition(
            position => {
                locationCoordinate = { 'latitude': position.coords.latitude, 'longitude': position.coords.longitude }
                setCoordinate(locationCoordinate);
            },
            error => console.log(JSON.stringify(error)),
            { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 },
        );
    }

    refresh = async () => {
        var locationCoordinate = await this.getLocation()

        var deviceId = await DeviceInfo.getUniqueId();
        var data = await getApiBanner(deviceId, locationCoordinate);
        if (data) {
            this.setState({
                dataDownloaded: true,
                woo: true,
                ads: data.ads,
                data,
            });
        } else {
            this.setState({
                dataDownloaded: true,
                woo: true
            })
        }
    }

    setNavigate = (event) => {
        if (event.url !== "" && event.url.indexOf('http') > -1 && this.webview) {
            this.webview.stopLoading();
            Linking.openURL(event.url);
        }
    }

    setClick = () => {
        setClickCountApi(this.state.data.sessionKey);
    }

    setView = async () => {
        await setViewApi(this.state.data.sessionKey);
    }

    onLoadEndWebView = () => {
        this.setView();
    }

    onMessage = (e) => {
        this.setClick();
    }

    getHTML = (html, width, height) => {
        width = reklam_wd(width, height);
        height = reklam_ht(width, height);

        return `<!DOCTYPE html>
        <html>

        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">

            <style>
                body {
                    padding: 0;
                    margin: 0;
                    width: ${width}'px';
                    height: ${height}'px';
                }
            </style>
        </head>
        <body id="html">${html}</body>
        <script>
            document.addEventListener('click', function (event) {
                window.ReactNativeWebView.postMessage("clicked");
            }, false);
        </script>
        </html>`;
    }

    render() {
        return this.state.dataDownloaded ? (
            this.state.woo && this.state.ads.code ?
                <View style={[styles.wooContainer, {
                    width: '100%',
                    height: reklam_ht(this.state.ads.width, this.state.ads.height),
                }]}>
                    <WebView
                        key={this.state.ads.id}
                        originWhitelist={['*']}
                        style={[styles.webViewStyle, {
                            width: reklam_wd(this.state.ads.width, this.state.ads.height),
                        }]}
                        ref={r => this.webview = r}
                        source={{
                            html: this.getHTML(this.state.ads.code, this.state.ads.width, this.state.ads.height)
                        }}
                        useWebKit
                        allowFileAccess={true}
                        javaScriptEnabled={true}
                        javaScriptEnabledAndroid={true}
                        scalesPageToFit={true}
                        thirdPartyCookiesEnabled={true}
                        domStorageEnabled={true}
                        startInLoadingState={false}
                        bounces={true}
                        allowUniversalAccessFromFileURLs={true}
                        mixedContentMode="always"
                        sharedCookiesEnabled={true}
                        allowFileAccessFromFileURLs={true}
                        cacheEnabled={true}
                        allowsLinkPreview={true}
                        mediaPlaybackRequiresUserAction={false}
                        allowsFullscreenVideo={false}
                        allowsInlineMediaPlayback={true}
                        onLoadEnd={this.onLoadEndWebView}
                        onError={this.onError}
                        onNavigationStateChange={this.setNavigate}
                        onMessage={this.onMessage}
                    />
                </View> : <Admob type={"banner"}></Admob>
        ) : null
    }
}

const styles = StyleSheet.create({
    wooContainer: {
        backgroundColor: color.BLACK,
    },
    webViewStyle: {
        alignSelf: 'center',
        backgroundColor: color.TRANSPARENT
    }
});