
import React from 'react';
import {
    StyleSheet,
    View
} from 'react-native';
import Video from 'react-native-video';


export default class App extends React.Component {
    constructor(props) {
        super(props);
        this.onBuffer = this.onBuffer.bind(this);
    }

    state = {
        duration: 0.0,
        currentTime: 0.0,
        volume: 1,
        muted: this.props.muted || false,
        controls: this.props.video || false,
        paused: false,
        isBuffering: false,
        link: this.props.link,
        title: this.props.title || "",
    }

    onLoad = async (data) => {
        this.setState({ duration: data.duration });
    }

    onLoadStart = async () => {
        this.props.onLoadStart();
    }
    onProgress = (data) => {
        this.setState({ currentTime: data.currentTime });
    }

    onBuffer = ({ isBuffering }) => {
        this.setState({ isBuffering: isBuffering, paused: this.state.paused });
        this.props.onBuffer(isBuffering);
    }

    getCurrentTimePercentage = () => {
        if (this.state.currentTime > 0) {
            return parseFloat(this.state.currentTime) / parseFloat(this.state.duration);
        } else {
            return 0;
        }
    }

    volumeChange = (volume) => {
        console.log(volume)
        this.setState({ volume })
    }

    pausedPlay = () => {
        this.setState({ paused: !this.state.paused })
    }

    render() {
        return (
            <View style={styles.container}>
                <Video
                    source={{ uri: this.state.link }}
                    ref={(ref) => {
                        this.player = ref
                    }}                                      // Store reference
                    onBuffer={this.onBuffer}                // Callback when remote video is buffering
                    onError={this.videoError}
                    onLoad={this.onLoad}
                    onLoadStart={this.onLoadStart}
                    paused={this.state.paused}
                    resizeMode="stretch"
                    onProgress={this.onProgress}
                    onEnd={this.props.onLoadEnd}
                    audioOnly={true}
                    allowsExternalPlayback={true}
                    controls={false}
                    muted={this.props.muted}
                    volume={this.state.volume}
                    style={styles.backgroundVideo}
                />
            </View>
        );
    }
};

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    backgroundVideo: {
        width: "100%",
        height: "100%",
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
    }
});