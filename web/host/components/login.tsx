import React, { Component } from 'react';

import Loading from '../../shared/components/loading';
import Backend from '../../shared/services/backend';
import LivePodcast from '../../shared/services/models/livePodcast';
import Sdk from '../../shared/services/sdk';

import '../styles/login.less';

type LoginProps = {
    handleOnSessionOpened: (podcastIdentifier: string) => void;
};

type LoginState = {
    username: string;
    canJoinPodcast: boolean;
    isLoading: boolean;
    loadingMessage: string;
    podcastIdentifier: string;
    podcasts: Array<LivePodcast>;
};

export default class Login extends Component<LoginProps, LoginState> {
    constructor(props: LoginProps) {
        super(props);

        this.state = {
            username: 'Guest ' + Math.round(Math.random() * 10000),
            canJoinPodcast: true,
            isLoading: false,
            loadingMessage: '',
            podcastIdentifier: '',
            podcasts: [],
        };

        this.handleChangePodcastSelection = this.handleChangePodcastSelection.bind(this);
        this.handleChangeUserName = this.handleChangeUserName.bind(this);

        this.joinPodcast = this.joinPodcast.bind(this);
    }

    async componentDidMount() {
        const podcasts = await Backend.listPodcasts();
        this.setState({
            podcasts: podcasts,
        });
    }

    handleChangePodcastSelection(e: React.ChangeEvent<HTMLSelectElement>) {
        const canJoinPodcast = e.target.value.length > 0 && this.state.username.length > 0;

        this.setState({
            podcastIdentifier: e.target.value,
            canJoinPodcast: canJoinPodcast,
        });
    }

    handleChangeUserName(e: React.ChangeEvent<HTMLInputElement>) {
        const canJoinPodcast = e.target.value.length > 0 && this.state.podcastIdentifier.length > 0;

        this.setState({
            username: e.target.value,
            canJoinPodcast: canJoinPodcast,
        });
    }

    async joinPodcast() {
        this.setState({
            isLoading: true,
            loadingMessage: 'Opening a session',
        });

        try {
            await Sdk.openSession(this.state.username, this.state.username);
            this.props.handleOnSessionOpened(this.state.podcastIdentifier);
        } catch (error) {
            this.setState({ isLoading: false });
            console.error(error);
        }
    }

    buildPodcastsOptions() {
        var arr = [];

        for (let index = 0; index < this.state.podcasts.length; index++) {
            const element = this.state.podcasts[index];
            arr.push(
                <option key={element.identifier} value={element.identifier}>
                    {element.podcastName}
                </option>
            );
        }

        return arr;
    }

    render() {
        if (this.state.isLoading) {
            return <Loading message={this.state.loadingMessage} />;
        }

        return (
            <div className="login container">
                <div className="row justify-content-center">
                    <div className="col-md-7 col-lg-5">
                        <div className="card card-lg mb-5">
                            <div className="card-body">
                                <div className="text-center">
                                    <h1>Podcast</h1>
                                </div>
                                <form>
                                    <div className="mb-3">
                                        <label htmlFor="input-podcast" className="form-label">
                                            Podcast to join
                                        </label>
                                        <select
                                            id="input-podcast"
                                            value={this.state.podcastIdentifier}
                                            onChange={this.handleChangePodcastSelection}
                                            className="form-select form-select-lg"
                                        >
                                            {this.buildPodcastsOptions()}
                                        </select>
                                    </div>

                                    <div className="mb-3">
                                        <label htmlFor="input-user-name" className="form-label">
                                            Your name
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control form-control-lg"
                                            id="input-user-name"
                                            value={this.state.username}
                                            onChange={this.handleChangeUserName}
                                        />
                                    </div>

                                    <div className="d-grid">
                                        <button
                                            type="button"
                                            className="btn btn-lg btn-primary"
                                            onClick={this.joinPodcast}
                                            disabled={!this.state.canJoinPodcast}
                                        >
                                            Join Podcast
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
