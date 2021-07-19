import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';

import VoxeetSDK from '@voxeet/voxeet-web-sdk';

import Backend from '../shared/services/backend';
import Sdk from '../shared/services/sdk';

import Loading from '../shared/components/loading';
import Login from './components/login';
import Studio from './components/studio';

import './styles/index.less';

type IndexState = {
    isLoading: boolean;
    loadingMessage: string;
    isLoggedIn: boolean;
    podcastName: string;
};

class Index extends Component<any, IndexState> {
    constructor(props: any) {
        super(props);

        this.state = {
            isLoading: true,
            loadingMessage: 'Loading...',
            isLoggedIn: false,
            podcastName: '',
        };

        this.onConferenceEndedOrLeft = this.onConferenceEndedOrLeft.bind(this);
        this.onSessionOpened = this.onSessionOpened.bind(this);

        console.log('GitHub repo: https://github.com/dolbyio-samples/dolbyio-podcast-studio');
    }

    async componentDidMount() {
        VoxeetSDK.conference.on('ended', this.onConferenceEndedOrLeft);
        VoxeetSDK.conference.on('left', this.onConferenceEndedOrLeft);

        try {
            await Sdk.initializeSDK();
            this.setState({ isLoading: false });
        } catch (error) {
            console.error(error);
        }

        // Remove the bottom left link from Google Chrome
        // From: https://stackoverflow.com/a/28206011
        $('body').on('mouseover', 'a', function () {
            var $link = $(this),
                href = $link.attr('href') || $link.data('href');

            $link.off('click.chrome');
            $link
                .on('click.chrome', () => (window.location.href = href))
                .attr('data-href', href)
                .css({ cursor: 'pointer' })
                .removeAttr('href');
        });
    }

    componentWillUnmount() {
        VoxeetSDK.conference.removeListener('ended', this.onConferenceEndedOrLeft);
        VoxeetSDK.conference.removeListener('left', this.onConferenceEndedOrLeft);
    }

    async onConferenceEndedOrLeft() {
        this.setState({
            isLoading: true,
            loadingMessage: 'Leaving the podcast',
        });

        try {
            await Sdk.closeSession();

            this.setState({
                isLoading: false,
                isLoggedIn: false,
            });
        } catch (error) {
            this.setState({ isLoading: false });
            console.error(error);
        }
    }

    async onSessionOpened(podcastName: string, podcastDescription: string) {
        const username = VoxeetSDK.session.participant.info.name;
        const externalId = VoxeetSDK.session.participant.info.externalId;

        console.group('Conference');
        console.log('Podcast name:', podcastName);
        console.log('Podcast description:', podcastDescription);
        console.log('Username:', username);
        console.log('External ID:', externalId);
        console.groupEnd();

        this.setState({
            isLoading: true,
            loadingMessage: 'Creating the podcast',
            podcastName: podcastName,
        });

        try {
            const conference = await Backend.createConference(externalId, podcastName, podcastDescription);

            this.setState({
                isLoading: true,
                loadingMessage: 'Joining the podcast',
            });

            await Sdk.joinConference(conference.conferenceId, conference.ownerToken, false, false);

            this.setState({
                isLoading: false,
                isLoggedIn: true,
            });
        } catch (error) {
            this.setState({ isLoading: false });
            console.error(error);
        }
    }

    render() {
        if (this.state.isLoading) {
            return <Loading message={this.state.loadingMessage} />;
        }

        if (!this.state.isLoggedIn) {
            return <Login handleOnSessionOpened={this.onSessionOpened} />;
        }

        return <Studio podcastName={this.state.podcastName} />;
    }
}

ReactDOM.render(<Index />, document.getElementById('root'));
