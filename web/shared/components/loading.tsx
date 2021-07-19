import React, { Component } from 'react';

import '../styles/loading.less';

type LoadingProps = {
    message: string;
};

export default class Loading extends Component<LoadingProps> {
    static defaultProps = {
        message: 'Loading...',
    };

    constructor(props: LoadingProps) {
        super(props);
    }

    render() {
        return (
            <div className="loading row h-100 align-items-center">
                <div className="mx-auto text-center">
                    <div className="ddloader mx-auto"></div>
                    <h1>{this.props.message}</h1>
                </div>
            </div>
        );
    }
}
