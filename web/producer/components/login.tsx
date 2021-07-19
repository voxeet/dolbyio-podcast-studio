import React, { Component } from 'react';

import Loading from '../../shared/components/loading';
import Sdk from '../../shared/services/sdk';

import '../styles/login.less';

type LoginProps = {
    handleOnSessionOpened: (podcastName: string, podcastDescription: string) => void;
};

type LoginState = {
    podcastName: string;
    podcastDescription: string;
    username: string;
    canCreatePodcast: boolean;
    isLoading: boolean;
    loadingMessage: string;
};

export default class Login extends Component<LoginProps, LoginState> {
    constructor(props: LoginProps) {
        super(props);

        let rand = Math.round(Math.random() * 10000);
        this.state = {
            podcastName: `Podcast #${rand}`,
            podcastDescription: `The greatest Podcast #${rand}`,
            username: 'producer',
            canCreatePodcast: true,
            isLoading: false,
            loadingMessage: '',
        };

        this.handleChangePodcastName = this.handleChangePodcastName.bind(this);

        this.createPodcast = this.createPodcast.bind(this);
    }

    handleChangePodcastName(e: React.ChangeEvent<HTMLInputElement>) {
        this.setState({
            podcastName: e.target.value,
            canCreatePodcast: this.state.podcastDescription.length > 0 && e.target.value.length > 0,
        });
    }

    handleChangePodcastDescription(e: React.ChangeEvent<HTMLInputElement>) {
        this.setState({
            podcastDescription: e.target.value,
            canCreatePodcast: this.state.podcastName.length > 0 && e.target.value.length > 0,
        });
    }

    async createPodcast() {
        this.setState({
            isLoading: true,
            loadingMessage: 'Opening a session',
        });

        try {
            await Sdk.openSession(this.state.username, this.state.username);
            this.props.handleOnSessionOpened(this.state.podcastName, this.state.podcastDescription);
        } catch (error) {
            this.setState({ isLoading: false });
            console.error(error);
        }
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
                                    <h1>Podcast Studio</h1>
                                </div>
                                <form>
                                    <div className="mb-3">
                                        <label htmlFor="input-podcast-name" className="form-label">
                                            Name of the podcast
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control form-control-lg"
                                            placeholder="Name of the podcast"
                                            id="input-podcast-name"
                                            value={this.state.podcastName}
                                            onChange={this.handleChangePodcastName}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="input-podcast-description" className="form-label">
                                            Description of the podcast
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control form-control-lg"
                                            placeholder="Description of the podcast"
                                            id="input-podcast-description"
                                            value={this.state.podcastDescription}
                                            onChange={this.handleChangePodcastDescription}
                                        />
                                    </div>

                                    <div className="d-grid">
                                        <button
                                            type="button"
                                            className="btn btn-lg btn-primary"
                                            onClick={this.createPodcast}
                                            disabled={!this.state.canCreatePodcast}
                                        >
                                            Create Podcast
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
