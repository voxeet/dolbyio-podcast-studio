import React, { Component } from 'react';

import { MediaStreamWithType } from '@voxeet/voxeet-web-sdk/types/models/MediaStream';

type VideoElementProps = {
    stream: MediaStreamWithType;
};

export default class VideoElement extends Component<VideoElementProps> {
    video: HTMLVideoElement;

    constructor(props: VideoElementProps) {
        super(props);
    }

    shouldComponentUpdate(nextProps: VideoElementProps, nextState: any) {
        return false;
    }

    componentDidMount() {
        this.updateStream(this.props);
    }

    updateStream(props: VideoElementProps) {
        const nav: any = navigator;
        nav.attachMediaStream(this.video, props.stream);
    }

    render() {
        return <video ref={(ref) => (this.video = ref)} playsInline autoPlay muted />;
    }
}
