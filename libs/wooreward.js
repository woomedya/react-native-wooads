import React, { Component, } from "react";
import { View, SafeAreaView, StyleSheet, Text, Dimensions, Linking, Platform, StatusBar } from "react-native";
import { getApiReward, setViewApi, setClickCountApi } from "./request";
import Modal from "react-native-modal";
import { Button } from "react-native-elements";
import { color } from "./color";
import DeviceInfo from 'react-native-device-info';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Geolocation from '@react-native-community/geolocation';
import { getCoordinate, setCoordinate } from './locationrepo';
import WebView from 'react-native-webview';

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
    const { width, height } = Dimensions.get('window');
    aw = aw || width;
    ah = ah || height;

    aw = Number(aw);
    ah = Number(ah);
    var wd = stretchByDimension(aw, ah, width, height).width
    return wd;
}

const reklam_ht = (aw, ah) => {
    const { width, height } = Dimensions.get('window');
    aw = aw || width;
    ah = ah || height;

    aw = Number(aw);
    ah = Number(ah);
    ht = stretchByDimension(aw, ah, width, height).height
    return ht;
}

export default class WooReward extends Component {
    constructor(props) {
        super(props)
        this.props = props;

        this.webview = null;
        this.onReward = null;

        this.state = {
            isModalVisible: false,
            data: {},
            ads: {},
            timer: 0,
            closeEnable: true
        };
    }

    componentWillUnmount() {
        clearInterval(this.clockCall);
    }

    onClose = (admob) => {
        if (this.props.onClose)
            this.props.onClose(admob);

        if (!admob && this.onReward)
            this.onReward();
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
        var data = await getApiReward(deviceId, locationCoordinate);

        return await new Promise(res => {
            if (data) {
                this.setState({
                    closeEnable: true,
                    timer: data.ads.duration == null ? 0 : data.ads.duration || 0,
                    ads: data.ads || {},
                    data,
                    isModalVisible: true,
                });

                this.onReward = () => {
                    res('ok');
                }
            } else {
                this.setState({ isModalVisible: false }, () => {
                    this.onClose(true);
                });
                res('fail');
            }
        });
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
        this.clockCall = setInterval(() => {
            this.decrementClock();
        }, 1000);
    }

    decrementClock = () => {
        if (this.state.timer <= 0) {
            clearInterval(this.clockCall);
            this.setState({ closeEnable: false })
        } else {
            this.setState(() => ({
                timer: this.state.timer - 1
            }), () => {
                if (this.state.timer === 0) {
                    clearInterval(this.clockCall);
                    this.setState({ closeEnable: false })
                }
            })
        }
    }

    closeModel = async () => {
        if (this.state.timer <= 0)
            this.setState({ isModalVisible: false }, () => {
                this.onClose();
            });
    }

    onError = (err) => {
        clearInterval(this.clockCall);
        this.setState({ closeEnable: false })
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
        return this.state.ads.id ? <SafeAreaView style={styles.view}>
            <Modal isVisible={this.state.isModalVisible}>
                <SafeAreaView style={[styles.modal, {
                    width: reklam_wd(this.state.ads.width, this.state.ads.height),
                    height: reklam_ht(this.state.ads.width, this.state.ads.height),
                }]}>
                    <View style={styles.headerView} >
                        <View style={[styles.HeaderRightView]}>
                            <Text style={styles.headerText}> {this.state.timer > 0 ? this.state.timer : ""}</Text>
                            <Button
                                buttonStyle={styles.headerButton}
                                loadingStyle={styles.headerButton}
                                icon={
                                    this.state.closeEnable ? null :
                                        <Icon name="close" color="white" size={20} style={styles.closeBtn} />
                                }
                                loading={this.state.closeEnable}
                                onPress={this.closeModel}
                            />
                        </View>
                    </View>
                    <View style={styles.contentView}>
                        <WebView
                            key={this.state.ads.id}
                            originWhitelist={['*']}
                            style={styles.webViewStyle}
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
                    </View>
                </SafeAreaView>
            </Modal>
        </SafeAreaView> : null
    }
}

const styles = StyleSheet.create({
    view: {
        position: "absolute",
        flex: 1,
        backgroundColor: "#fff",
    },
    modal: {
        alignSelf: "center",
        backgroundColor: color.TRANSPARENT,
    },
    contentView: {
        flex: 1,
        width: "auto",
        height: "auto",
        zIndex: -1,
        backgroundColor: color.BLACK,
    },
    headerView: {
        position: 'absolute',
        right: 0,
        top: 0,
        flexDirection: "row",
        backgroundColor: color.TRANSPARENT,
        justifyContent: "space-between",
        width: "auto",
        paddingRight: 1,
        paddingTop: 8,
        zIndex: 1,
    },
    headerText: {
        alignSelf: "center",
        color: color.WHITE,
        fontSize: 15,
        right: 10,
    },
    HeaderRightView: {
        flexDirection: "row",
        top: -7,
    },
    headerButton: {
        width: 25,
        height: 25,
        alignSelf: "center",
        backgroundColor: color.WET_ASPHALT,
        borderRadius: 25 / 2,
        borderColor: color.WHITE,
        borderWidth: 1,
        borderColor: 'white',
    },
    closeBtn: {
        position: "absolute",
        left: 1.5, top: 1.5,
        alignSelf: "center"
    },
    webViewStyle: { backgroundColor: color.TRANSPARENT }
});