import React, { Component } from 'react';

import VoxeetSDK from '@voxeet/voxeet-web-sdk';

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
        if (VoxeetSDK.conference.participants.size > 0) {
            const participant = VoxeetSDK.conference.participants.values().next().value;
            if (participant.streams) {
                for (let index = 0; index < participant.streams.length; index++) {
                    const stream = participant.streams[index];
                    if (stream.getVideoTracks().length) {
                        this.addVideoNode(participant, stream);
                        break;
                    }
                }
            }

            this.setState({ iAmAlone: this.videoNodes.length <= 0 });
        }
    }

    componentWillUnmount() {
        VoxeetSDK.conference.removeListener('streamAdded', this.onStreamAdded);
        VoxeetSDK.conference.removeListener('streamUpdated', this.onStreamUpdated);
        VoxeetSDK.conference.removeListener('streamRemoved', this.onStreamRemoved);
    }

    onStreamAdded(participant: any, stream: any) {
        if (stream.getVideoTracks().length) {
            // Only add the video node if there is a video track
            this.addVideoNode(participant, stream);
        }
    }

    onStreamUpdated(participant: any, stream: any) {
        if (stream.getVideoTracks().length) {
            // Only add the video node if there is a video track
            this.addVideoNode(participant, stream);
        } else {
            this.removeVideoNode(participant.id);
        }
    }

    onStreamRemoved(participant: any, stream: any) {
        this.removeVideoNode(participant.id);
    }

    addVideoNode(participant: any, stream: any) {
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
        if (this.state.iAmAlone) {
            return (
                <div className="alone-title row h-100 align-items-center">
                    <div className="mx-auto text-center">
                        <div className="image mx-auto mb-4"></div>
                        <h1>I am all alone here...</h1>
                    </div>
                </div>
            );
        }

        /*return (
            <div className="container">
                <div className="row">
                    {this.state.videoNodes.map((element, i) => {
                        return (
                            <div className="col">
                                {element}
                            </div>
                        );
                    })}
                </div>
            </div>
        );*/
        return <div className="rendering">{this.state.videoNodes}</div>;
    }
}
