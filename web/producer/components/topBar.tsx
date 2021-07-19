import React, { Component } from 'react';

import VoxeetSDK from '@voxeet/voxeet-web-sdk';

import Backend from '../../shared/services/backend';

import '../styles/topBar.less';

type TopBarProps = {
    podcastName: string;
};

type TopBarState = {
    nbListeners: number;
};

export default class TopBar extends Component<TopBarProps, TopBarState> {
    constructor(props: TopBarProps) {
        super(props);

        this.state = {
            nbListeners: 0,
        };
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

    async terminate() {
        try {
            await Backend.terminateConference(VoxeetSDK.conference.current.id);
        } catch (error) {
            console.error(error);
        }
    }

    render() {
        return (
            <div className="topBar row">
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
                            <button type="button" className="btn btn-danger btn-xl" onClick={this.terminate.bind(this)} title="Terminate the podcast">
                                Terminate
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
