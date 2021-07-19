import React, { Component } from 'react';

import VoxeetSDK from '@voxeet/voxeet-web-sdk';
import { Participant } from '@voxeet/voxeet-web-sdk/types/models/Participant';
import { MediaStreamWithType } from '@voxeet/voxeet-web-sdk/types/models/MediaStream';
import RecordRTC from 'recordrtc';

import VideoElement from '../../shared/components/videoElement';
import Sdk from '../../shared/services/sdk';

import '../styles/settings.less';

type SettingsProps = {};

type SettingsState = {
    videoElement: JSX.Element;
    sampleRate: number;
};

export default class Settings extends Component<SettingsProps, SettingsState> {
    static defaultProps = {};

    videoElement: JSX.Element;
    mediaRecorder: RecordRTC;

    constructor(props: SettingsProps) {
        super(props);

        this.state = {
            videoElement: null,
            sampleRate: 48000,
        };

        this.onStreamAdded = this.onStreamAdded.bind(this);
        this.onStreamUpdated = this.onStreamUpdated.bind(this);
        this.onStreamRemoved = this.onStreamRemoved.bind(this);
        this.addVideoNode = this.addVideoNode.bind(this);
        this.removeVideoNode = this.removeVideoNode.bind(this);

        this.initializeLocalAudioCapture = this.initializeLocalAudioCapture.bind(this);
        this.startAudioCapture = this.startAudioCapture.bind(this);
        this.stopAudioCapture = this.stopAudioCapture.bind(this);

        this.handleChangeSampleRate = this.handleChangeSampleRate.bind(this);
    }

    componentDidMount() {
        VoxeetSDK.conference.on('streamAdded', this.onStreamAdded);
        VoxeetSDK.conference.on('streamUpdated', this.onStreamUpdated);
        VoxeetSDK.conference.on('streamRemoved', this.onStreamRemoved);

        if (VoxeetSDK.session.participant?.streams) {
            for (let index = 0; index < VoxeetSDK.session.participant.streams.length; index++) {
                const stream = VoxeetSDK.session.participant.streams[index];
                if (stream.getVideoTracks().length) {
                    this.addVideoNode(stream);
                    this.initializeLocalAudioCapture(stream);
                    break;
                }
            }
        }
    }

    componentWillUnmount() {
        this.stopAudioCapture();

        VoxeetSDK.conference.removeListener('streamAdded', this.onStreamAdded);
        VoxeetSDK.conference.removeListener('streamUpdated', this.onStreamUpdated);
        VoxeetSDK.conference.removeListener('streamRemoved', this.onStreamRemoved);
    }

    onStreamAdded(participant: Participant, stream: MediaStreamWithType) {
        if (participant.id !== VoxeetSDK.session.participant.id) return;

        console.log(`${Date.now()} - streamAdded from ${participant.info.name} (${participant.id})`);

        if (stream.getVideoTracks().length) {
            // Only add the video node if there is a video track
            this.addVideoNode(stream);
        }

        this.initializeLocalAudioCapture(stream);
    }

    onStreamUpdated(participant: Participant, stream: MediaStreamWithType) {
        if (participant.id !== VoxeetSDK.session.participant.id) return;

        console.log(`${Date.now()} - onStreamUpdated from ${participant.info.name} (${participant.id})`);

        if (stream.getVideoTracks().length) {
            // Only add the video node if there is a video track
            this.addVideoNode(stream);
        } else {
            this.removeVideoNode();
        }
    }

    onStreamRemoved(participant: Participant, stream: MediaStreamWithType) {
        if (participant.id !== VoxeetSDK.session.participant.id) return;

        console.log(`${Date.now()} - onStreamRemoved from ${participant.info.name} (${participant.id})`);

        this.removeVideoNode();

        this.stopAudioCapture();
    }

    addVideoNode(stream: MediaStreamWithType) {
        if (this.videoElement) return;

        let videoElement = <VideoElement stream={stream} />;

        this.videoElement = videoElement;
        this.setState({
            videoElement: this.videoElement,
        });
    }

    removeVideoNode() {
        this.videoElement = null;
        this.setState({
            videoElement: this.videoElement,
        });
    }

    initializeLocalAudioCapture(stream: MediaStreamWithType) {
        console.log('Initialize local audio recorder...');

        this.mediaRecorder = RecordRTC(stream, {
            type: 'audio', // Only record the Audio
            mimeType: 'audio/webm;codecs=pcm',
            numberOfAudioChannels: 2,
            bufferSize: 16384,
            sampleRate: this.state.sampleRate,
            desiredSampRate: this.state.sampleRate,
        });

        this.startAudioCapture();
    }

    startAudioCapture() {
        if (!this.mediaRecorder) {
            // Recorder is not initialized
            return;
        }

        if (this.mediaRecorder.state == 'recording') {
            this.stopAudioCapture();
        }

        const internalRecorder = this.mediaRecorder.getInternalRecorder();
        if (internalRecorder) {
            internalRecorder.sampleRate = this.state.sampleRate;
            internalRecorder.desiredSampRate = this.state.sampleRate;
        }

        console.log(`Start local Audio Capture with ${this.state.sampleRate} Hz sample rate.`);

        this.mediaRecorder.startRecording();
        Sdk.startLocalRecording();
    }

    stopAudioCapture() {
        const md = this.mediaRecorder;
        md.stopRecording(function () {
            md.save();
        });
    }

    handleChangeSampleRate(e: React.ChangeEvent<HTMLSelectElement>) {
        this.setState({
            sampleRate: parseInt(e.target.value),
        });
    }

    render() {
        return (
            <div className="settings">
                {this.state.videoElement}

                <h3>Local recording settings</h3>

                <div className="mb-3">
                    <label htmlFor="input-sample-rate" className="form-label">
                        Sample rate
                    </label>
                    <select className="form-select" aria-label="Sample rate" defaultValue={this.state.sampleRate} onChange={this.handleChangeSampleRate}>
                        <option value="16000">16 kHz</option>
                        <option value="41000">44.1 kHz</option>
                        <option value="48000">48 kHz</option>
                        <option value="88200">88.2 kHz</option>
                        <option value="96000">96 kHz</option>
                    </select>
                </div>

                <div className="d-grid gap-2 col-6 mx-auto">
                    <button type="button" className="btn btn-lg btn-primary" onClick={this.startAudioCapture}>
                        Save
                    </button>
                </div>
            </div>
        );
    }
}
