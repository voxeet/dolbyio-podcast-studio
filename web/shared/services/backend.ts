import LivePodcast from './models/livePodcast';
import Invitation from './models/invitation';

/**
 * Requests a session access token from the backend.
 * @return The session access token provided by the backend.
 */
const getAccessToken = async (): Promise<string> => {
    const url = getEndpointUrl('access-token');
    const response = await fetch(url);
    if (!response.ok) {
        const text = await response.text();
        throw new Error(text);
    }

    const jwt = await response.json();
    return jwt.access_token;
};

/**
 * List the live podcasts.
 * @return The list of live podcasts.
 */
const listPodcasts = async (): Promise<LivePodcast[]> => {
    const options = {
        method: 'GET',
    };

    // Request the backend to create a conference
    const url = getEndpointUrl('list');
    const response = await fetch(url, options);
    if (!response.ok) {
        const text = await response.text();
        throw new Error(text);
    }

    const podcasts = await response.json();

    let result = [];
    for (let index = 0; index < podcasts.length; index++) {
        const podcast = podcasts[index];
        if (podcast.isLive) {
            result.push(podcast);
        }
    }

    return result;
};

/**
 * Requests an invitation to access the conference.
 * @param podcastIdentifier Podcast identifier.
 * @param isListener Flag indicating if the user is a listener or a participant.
 * @param externalId External ID of the user.
 * @return The invitation object.
 */
const getInvitation = async (podcastIdentifier: string, isListener: boolean, externalId: string): Promise<Invitation> => {
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=utf-8',
        },
        body: JSON.stringify({
            podcastIdentifier: podcastIdentifier,
            externalId: externalId,
            isListener: isListener,
        }),
    };

    // Request the backend for an invitation
    const url = getEndpointUrl('invitation');
    const response = await fetch(url, options);
    if (!response.ok) {
        const text = await response.text();
        throw new Error(text);
    }

    return response.json();
};

/**
 * Requests the backend to create a conference.
 * @param externalId External ID of the user.
 * @param podcastName Name of the Podcast.
 * @param podcastDescription Description of the Podcast.
 * @return The conference object.
 */
const createConference = async (externalId: string, podcastName: string, podcastDescription: string) => {
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=utf-8',
        },
        body: JSON.stringify({
            ownerExternalId: externalId,
            podcastName: podcastName,
            podcastDescription: podcastDescription,
        }),
    };

    // Request the backend to create a conference
    const url = getEndpointUrl('conference');
    const response = await fetch(url, options);
    if (!response.ok) {
        const text = await response.text();
        throw new Error(text);
    }

    return response.json();
};

/**
 * Requests the terminate the conference.
 * @param conferenceId Conference identifier.
 */
const terminateConference = async (conferenceId: string): Promise<void> => {
    const options = {
        method: 'DELETE',
    };

    // Request the backend to create a conference
    const url = getEndpointUrl(`conference/${conferenceId}`);
    const response = await fetch(url, options);
    if (!response.ok) {
        const text = await response.text();
        throw new Error(text);
    }
};

/**
 * Starts the live streaming to an RTMP endpoint.
 * @param conferenceId Conference identifier.
 * @param rtmpUrl URL of the RTMP endpoint.
 */
const startStreaming = async (conferenceId: string, rtmpUrl: string): Promise<void> => {
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=utf-8',
        },
        body: JSON.stringify({
            rtmpUrl: rtmpUrl,
        }),
    };

    // Request the backend to start the live streaming
    const url = getEndpointUrl(`stream/${conferenceId}/start`);
    const response = await fetch(url, options);
    if (!response.ok) {
        const text = await response.text();
        throw new Error(text);
    }

    return response.json();
};

/**
 * Stops the live streaming to an RTMP endpoint.
 * @param conferenceId Conference identifier.
 */
const stopStreaming = async (conferenceId: string): Promise<void> => {
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=utf-8',
        },
    };

    // Request the backend to stop the live streaming
    const url = getEndpointUrl(`stream/${conferenceId}/stop`);
    const response = await fetch(url, options);
    if (!response.ok) {
        const text = await response.text();
        throw new Error(text);
    }

    return response.json();
};

/**
 * Gets the full endpoint URL.
 * @param endpoint API name to generate the URL with.
 * @returns the full endpoint URL.
 */
const getEndpointUrl = (endpoint: string): string => {
    let currentURL: string = window.location.href;

    if (currentURL.endsWith('/')) {
        currentURL = currentURL.slice(0, currentURL.length - 1);
    }

    return currentURL.slice(0, currentURL.lastIndexOf('/') + 1) + endpoint + '/';
};

export default {
    getAccessToken,
    listPodcasts,
    getInvitation,
    createConference,
    terminateConference,
};
