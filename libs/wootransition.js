import React, { Component, } from "react";
import { View, SafeAreaView, StyleSheet, ActivityIndicator, Text, TouchableOpacity, Linking } from "react-native";
import { getApi, setViewApi } from "./request";
import Modal from "react-native-modal";
import { Button, Image } from "react-native-elements";
import { color } from "./color";
import UrlStream from './stream';
import DeviceInfo from 'react-native-device-info';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Geolocation from '@react-native-community/geolocation';
import { getCoordinate, setCoordinate } from './locationrepo';

export default class WooTransition extends Component {
    constructor(props) {
        super(props)
        this.props = props;

        this.state = {
            isModalVisible: false,
            data: {},
            ads: {},
            timer: 5,
            closeEnable: true,
            videoMuted: false,
            videoOnLoadStart: false,
            videoOnBuffer: false,
            videoOnLoadEnd: false,
            videoOnstop: false,
        };
    }

    componentDidMount = () => {
        this.refresh();
    }

    componentWillUnmount() {
        clearInterval(this.clockCall);
    }

    onClose = (admob) => {
        if (this.props.onClose)
            this.props.onClose(admob);
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
        var data = await getApi(deviceId, locationCoordinate);
        if (data) {
            this.setState({
                closeEnable: true,
                timer: data.ads.duration || 5,
                ads: data.ads,
                data,
                isModalVisible: true
            });
        } else {
            this.setState({ isModalVisible: false }, () => {
                this.onClose(true);
            });
        }
    }

    setView = async () => {
        await setViewApi(this.state.data.sessionKey);
    }

    onLoadEndWebView = async () => {
        await this.setView();
        this.clockCall = setInterval(() => {
            this.decrementClock();
        }, 1000);
    }

    decrementClock = () => {
        if (!this.state.timer <= 0)
            this.setState(() => ({
                timer: this.state.timer - 1
            }), () => {
                if (this.state.timer === 0) {
                    clearInterval(this.clockCall)
                    this.setState({ closeEnable: false })
                }
            })
    }

    closeModel = async () => {
        if (this.state.timer <= 0)
            this.setState({ isModalVisible: false, videoOnstop: true }, this.onClose);
    }

    contentImagePres = () => {
        Linking.openURL(this.state.ads.goToUrl);
    }

    onLoadStart = () => {
        this.setState({ videoOnLoadStart: true }, () => {
            this.onLoadEndWebView();
        });
    }

    onLoadEnd = () => {
        this.setState({ videoOnLoadEnd: true });
    }

    onBuffer = (isBuffering) => {
        this.setState({ videoOnBuffer: isBuffering });
    }

    onMute = () => {
        this.setState({ videoMuted: !this.state.videoMuted });
    }

    render() {
        return (
            <SafeAreaView style={styles.view}>
                <Modal isVisible={this.state.isModalVisible}>
                    <SafeAreaView style={styles.modal}>
                        {this.state.ads.mediaType == "Video" && !this.state.videoOnLoadEnd ?
                            <TouchableOpacity style={styles.muteTouch}
                                onPress={this.onMute}>
                                <Icon name="volume-up" color="white" size={20}
                                    style={styles.muteIcon} />
                            </TouchableOpacity>
                            : null
                        }
                        <View style={styles.headerView} >
                            <View style={[styles.HeaderRightView]}>
                                <Text style={styles.headerText}> {this.state.timer > 0 ? this.state.timer : ""}</Text>
                                <Button
                                    buttonStyle={styles.headerButton}
                                    loadingStyle={styles.headerButton}
                                    icon={this.state.closeEnable ? null : <Icon name="close" color="white" size={20} style={styles.closeBtn} />}
                                    loading={this.state.closeEnable}
                                    onPress={this.closeModel}
                                />
                            </View>
                        </View>
                        <View style={styles.contentView}>
                            {
                                this.state.ads.mediaType == "Video" && !this.state.videoOnLoadEnd ?
                                    <UrlStream
                                        link={this.state.ads.videoUrl}
                                        title={this.state.ads.title}
                                        video={true}
                                        paused={this.state.videoOnstop}
                                        muted={this.state.videoMuted}
                                        onBuffer={this.onBuffer}
                                        onLoadStart={this.onLoadStart}
                                        onLoadEnd={this.onLoadEnd}
                                    /> : null
                            }
                            {
                                this.state.ads.contentUrl ?
                                    <TouchableOpacity
                                        style={
                                            !this.state.ads.mediaType == "Image" && this.state.ads.contentUrl ? {} :
                                                (!this.state.ads.contentUrl || (this.state.ads.mediaType == "Video" && !this.state.videoOnLoadEnd)
                                                    ? { display: "none" } : {})}
                                        onPress={this.contentImagePres}>
                                        <Image
                                            resizeMode="stretch"
                                            source={{ uri: this.state.ads.contentUrl }}
                                            containerStyle={styles.image}
                                            placeholderStyle={styles.image}
                                            onLoadEnd={e => this.onLoadEndWebView()}
                                        />
                                    </TouchableOpacity> : null
                            }
                        </View>
                        <View style={styles.bottomView}>
                            <TouchableOpacity onPress={this.contentImagePres}>
                                <Image
                                    key={this.state.ads.goToBackgroundUrl}
                                    resizeMode="stretch"
                                    source={{ uri: this.state.ads.goToBackgroundUrl }}
                                    containerStyle={styles.bottomImage}
                                    placeholderStyle={styles.bottomImage}
                                    PlaceholderContent={<ActivityIndicator />}
                                />
                            </TouchableOpacity>
                        </View>
                    </SafeAreaView>
                </Modal>
            </SafeAreaView>
        );
    }
}

const styles = StyleSheet.create({
    view: {
        position: "absolute",
        flex: 1,
        backgroundColor: "#fff",
    },
    modal: {
        flex: 1,
        backgroundColor: color.TRANSPARENT,
    },
    contentView: {
        flex: 1,
        width: "auto",
        height: "auto",
        zIndex: -1,
        backgroundColor: color.BLACK,
    },
    image: {
        width: "auto",
        height: "100%",
        backgroundColor: color.WHITE

    },
    headerView: {
        position: 'absolute',
        right: 0,
        top: 0,
        flexDirection: "row",
        backgroundColor: color.TRANSPARENT,
        justifyContent: "space-between",
        width: "auto",
        paddingRight: 10,
        paddingTop: 20,
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
    bottomView: {
        backgroundColor: color.WHITE,
        justifyContent: "center",
        width: "auto",
        height: 70,
        zIndex: 1,
    },
    bottomImage: {
        width: "auto",
        height: 70,
        backgroundColor: color.WHITE
    },
    muteTouch: {
        width: 20,
        height: 20,
        position: "absolute",
        top: 0,
        padding: 15,
    },
    muteIcon: {
        width: 20,
        height: 20
    },
    closeBtn: {
        position: "absolute",
        left: 1.5, top: 1.5,
        alignSelf: "center"
    }
});