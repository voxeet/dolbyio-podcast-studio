import React, { Component } from 'react';

import VoxeetSDK from '@voxeet/voxeet-web-sdk';
import { Participant } from '@voxeet/voxeet-web-sdk/types/models/Participant';
import { MediaStreamWithType } from '@voxeet/voxeet-web-sdk/types/models/MediaStream';

import VideoElement from '../../shared/components/videoElement';

import '../styles/rendering.less';

type RenderingProps = {
    message: string;
};

type RenderingState = {
    videoNodes: Array<JSX.Element>;
    iAmAlone: boolean;
};

export default class Rendering extends Component<RenderingProps, RenderingState> {
    static defaultProps = {
        message: 'Loading...',
    };

    videoNodes: JSX.Element[];

    constructor(props: RenderingProps) {
        super(props);

        this.videoNodes = [];
        this.state = {
            videoNodes: this.videoNodes,
            iAmAlone: true,
        };

        this.onStreamAdded = this.onStreamAdded.bind(this);
        this.onStreamUpdated = this.onStreamUpdated.bind(this);
        this.onStreamRemoved = this.onStreamRemoved.bind(this);
        this.addVideoNode = this.addVideoNode.bind(this);
        this.removeVideoNode = this.removeVideoNode.bind(this);
    }

    componentDidMount() {
        VoxeetSDK.conference.on('streamAdded', this.onStreamAdded);
        VoxeetSDK.conference.on('streamUpdated', this.onStreamUpdated);
        VoxeetSDK.conference.on('streamRemoved', this.onStreamRemoved);

        // Load the streams for all active participants after this component is loaded
        VoxeetSDK.conference.participants.forEach((participant) => {
            if (participant.streams) {
                for (let index = 0; index < participant.streams.length; index++) {
                    const stream = participant.streams[index];
                    if (stream.getVideoTracks().length) {
                        this.addVideoNode(participant, stream);
                        return;
                    }
                }
            }
        });

        this.setState({ iAmAlone: this.videoNodes.length <= 0 });
    }

    componentWillUnmount() {
        VoxeetSDK.conference.removeListener('streamAdded', this.onStreamAdded);
        VoxeetSDK.conference.removeListener('streamUpdated', this.onStreamUpdated);
        VoxeetSDK.conference.removeListener('streamRemoved', this.onStreamRemoved);
    }

    onStreamAdded(participant: Participant, stream: MediaStreamWithType) {
        if (stream.getVideoTracks().length) {
            // Only add the video node if there is a video track
            this.addVideoNode(participant, stream);
        }
    }

    onStreamUpdated(participant: Participant, stream: MediaStreamWithType) {
        if (stream.getVideoTracks().length) {
            // Only add the video node if there is a video track
            this.addVideoNode(participant, stream);
        } else {
            this.removeVideoNode(participant.id);
        }
    }

    onStreamRemoved(participant: Participant, stream: MediaStreamWithType) {
        this.removeVideoNode(participant.id);
    }

    addVideoNode(participant: Participant, stream: MediaStreamWithType) {
        // Do not display the local video
        if (participant.id == VoxeetSDK.session.participant.id) return;

        const key = `video-${participant.id}`;
        for (let index = 0; index < this.videoNodes.length; index++) {
            const videoNode = this.videoNodes[index];
            if (videoNode.key == key) {
                return;
            }
        }

        let videoNode = <VideoElement key={key} stream={stream} />;

        this.videoNodes.push(videoNode);
        this.setState({
            videoNodes: this.videoNodes,
            iAmAlone: this.videoNodes.length <= 0,
        });
    }

    removeVideoNode(participantId: string) {
        if (participantId == VoxeetSDK.session.participant.id) return;

        const key = `video-${participantId}`;

        const tmpVideoNodes = [];
        for (let index = 0; index < this.videoNodes.length; index++) {
            const videoNode = this.videoNodes[index];
            if (videoNode.key !== key) {
                tmpVideoNodes.push(videoNode);
            }
        }

        this.videoNodes = tmpVideoNodes;
        this.setState({
            videoNodes: this.videoNodes,
            iAmAlone: this.videoNodes.length <= 0,
        });
    }

    render() {
        return <div className="rendering">{this.state.videoNodes}</div>;
    }
}
