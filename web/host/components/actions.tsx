import React, { Component } from 'react';

import VoxeetSDK from '@voxeet/voxeet-web-sdk';
import { ConferencePermission } from '@voxeet/voxeet-web-sdk/types/models/Conference';

import Sdk from '../../shared/services/sdk';

import '../styles/actions.less';

type ActionsProps = {
    podcastName: string;
};

type ActionsState = {
    canStartVideo: boolean;
    canStopVideo: boolean;
    canMute: boolean;
    canUnmute: boolean;
    nbListeners: number;
};

export default class Actions extends Component<ActionsProps, ActionsState> {
    static defaultProps = {};

    constructor(props: ActionsProps) {
        super(props);

        this.state = {
            canStartVideo: false,
            canStopVideo: true,
            canMute: false,
            canUnmute: true,
            nbListeners: 0,
        };

        this.refreshPermissions();
    }

    componentDidMount() {
        VoxeetSDK.conference.on('participantAdded', this.countListeners);
        VoxeetSDK.conference.on('participantUpdated', this.countListeners);
    }

    componentWillUnmount() {
        VoxeetSDK.conference.removeListener('participantAdded', this.countListeners);
        VoxeetSDK.conference.removeListener('participantUpdated', this.countListeners);
    }

    countListeners() {
        var listeners = 0;

        VoxeetSDK.conference.participants.forEach((participant) => {
            if (participant.status === 'Connected' || participant.status === 'Inactive') {
                if (participant.type === 'listener') {
                    listeners++;
                }
            }
        });

        this.setState({
            nbListeners: listeners,
        });
    }

    refreshPermissions() {
        const canStartVideo = this.state.canStartVideo && VoxeetSDK.conference.current.permissions.has('SEND_VIDEO' as ConferencePermission);
        const canStopVideo = this.state.canStopVideo && VoxeetSDK.conference.current.permissions.has('SEND_VIDEO' as ConferencePermission);
        const canMute = this.state.canMute && VoxeetSDK.conference.current.permissions.has('SEND_AUDIO' as ConferencePermission);
        const canUnmute = this.state.canUnmute && VoxeetSDK.conference.current.permissions.has('SEND_AUDIO' as ConferencePermission);

        this.setState({
            canStartVideo: canStartVideo,
            canStopVideo: canStopVideo,
            canMute: canMute,
            canUnmute: canUnmute,
        });
    }

    async startVideo() {
        try {
            await Sdk.startVideo();

            this.setState({
                canStartVideo: false,
                canStopVideo: true,
            });
        } catch (error) {
            console.error(error);
        }
    }

    async stopVideo() {
        try {
            await Sdk.stopVideo();

            this.setState({
                canStartVideo: true,
                canStopVideo: false,
            });
        } catch (error) {
            console.error(error);
        }
    }

    mute() {
        Sdk.mute();

        this.setState({
            canMute: false,
            canUnmute: true,
        });
    }

    unmute() {
        Sdk.unmute();

        this.setState({
            canMute: true,
            canUnmute: false,
        });
    }

    async leave() {
        await Sdk.leaveConference();
    }

    render() {
        return (
            <div className="actions row">
                <div className="col">
                    <div className="d-flex justify-content-between">
                        <div className="col-left">
                            <span>
                                {this.state.nbListeners} listener{this.state.nbListeners > 1 ? 's' : ''}
                            </span>
                        </div>
                        <div className="col-center">
                            <span>{this.props.podcastName}</span>
                        </div>
                        <div className="col-right">
                            <span className="separator" />
                            {this.state.canStartVideo && (
                                <button type="button" className="btn btn-action btn-xl" onClick={this.startVideo.bind(this)} title="Start the video">
                                    <i className="fas fa-video-slash"></i>
                                </button>
                            )}
                            {this.state.canStopVideo && (
                                <button type="button" className="btn btn-action btn-xl" onClick={this.stopVideo.bind(this)} title="Stop the video">
                                    <i className="fas fa-video"></i>
                                </button>
                            )}
                            {this.state.canMute && (
                                <button type="button" className="btn btn-action btn-xl" onClick={this.mute.bind(this)} title="Mute the microphone">
                                    <i className="fas fa-microphone"></i>
                                </button>
                            )}
                            {this.state.canUnmute && (
                                <button type="button" className="btn btn-action btn-xl" onClick={this.unmute.bind(this)} title="Unmute the microphone">
                                    <i className="fas fa-microphone-slash"></i>
                                </button>
                            )}
                            <button type="button" className="btn btn-danger btn-xl" onClick={this.leave.bind(this)} title="Leave the podcast">
                                Leave
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
