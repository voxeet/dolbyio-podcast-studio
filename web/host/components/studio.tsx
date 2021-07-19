import React, { Component } from 'react';

import Actions from './actions';
import Settings from './settings';
import Rendering from './rendering';

import '../styles/studio.less';

type StudioProps = {
    podcastName: string;
};

type StudioState = {};

export default class Studio extends Component<StudioProps, StudioState> {
    constructor(props: StudioProps) {
        super(props);

        this.state = {};
    }

    render() {
        return (
            <main className="podcast container-fluid d-flex h-100 flex-column">
                <Actions podcastName={this.props.podcastName} />
                <div className="row flex-grow-1">
                    <div className="main-panel col-9">
                        <Rendering />
                    </div>
                    <div className="side-panel col-3">
                        <Settings />
                    </div>
                </div>
            </main>
        );
    }
}
