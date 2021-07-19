import React, { Component } from 'react';

import VoxeetSDK from '@voxeet/voxeet-web-sdk';
import { ConferencePermission } from '@voxeet/voxeet-web-sdk/types/models/Conference';

import Sdk from '../../shared/services/sdk';

import '../styles/settings.less';

type SettingsProps = {};

type SettingsState = {
    isRecording: boolean;
    canStartRecording: boolean;
    canStopRecording: boolean;
    recordingLength: string;
};

export default class Settings extends Component<SettingsProps, SettingsState> {
    static defaultProps = {};

    private _interval: NodeJS.Timeout;

    constructor(props: SettingsProps) {
        super(props);

        this.state = {
            isRecording: false,
            canStartRecording: false,
            canStopRecording: false,
            recordingLength: '',
        };

        this.refreshCounter = this.refreshCounter.bind(this);
    }

    componentDidMount() {
        const isRecording = VoxeetSDK.recording.current != null;
        const canRecord = VoxeetSDK.conference.current != null && VoxeetSDK.conference.current.permissions.has('RECORD' as ConferencePermission);

        this.setState({
            isRecording: isRecording,
            canStartRecording: canRecord && !isRecording,
            canStopRecording: canRecord && isRecording,
        });
    }

    componentWillUnmount() {
        clearInterval(this._interval);
    }

    refreshCounter() {
        const totalSeconds = Math.trunc((new Date().getTime() - VoxeetSDK.recording.current.startTimestamp) / 1000);
        const hours = Math.trunc(totalSeconds / 60 / 60);
        const minutes = Math.trunc((totalSeconds - hours * 60 * 60) / 60);
        const seconds = Math.trunc(totalSeconds - hours * 60 * 60 - minutes * 60);

        this.setState({
            recordingLength: `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`,
        });
    }

    async startRecording() {
        try {
            await Sdk.startRecording();

            this.setState({
                isRecording: true,
                canStartRecording: false,
                canStopRecording: true,
            });

            this._interval = setInterval(this.refreshCounter, 1000);
        } catch (error) {
            console.error(error);
        }
    }

    async stopRecording() {
        try {
            await Sdk.stopRecording();

            this.setState({
                isRecording: false,
                canStartRecording: true,
                canStopRecording: false,
            });
        } catch (error) {
            console.error(error);
        }
    }

    render() {
        return (
            <div className="settings">
                {this.state.canStartRecording && (
                    <button type="button" className="btn btn-action btn-xl" onClick={this.startRecording.bind(this)} title="Start the recording">
                        Start Recording
                    </button>
                )}
                {this.state.canStopRecording && (
                    <button type="button" className="btn btn-action btn-xl" onClick={this.stopRecording.bind(this)} title="Stop the recording">
                        Stop Recording
                    </button>
                )}
                {this.state.isRecording && (
                    <span className="recording">
                        <i className="fas fa-circle"></i> Recording is on {this.state.recordingLength}
                    </span>
                )}
            </div>
        );
    }
}
