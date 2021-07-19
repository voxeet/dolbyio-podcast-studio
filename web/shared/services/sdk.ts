import VoxeetSDK from '@voxeet/voxeet-web-sdk';

import Backend from './backend';

/**
 * Initializes the Voxeet SDK.
 * @return A Promise for the completion of the function.
 */
const initializeSDK = async (): Promise<void> => {
    const accessToken = await Backend.getAccessToken();
    VoxeetSDK.initializeToken(accessToken, Backend.getAccessToken);
    console.log('VoxeetSDK Initialized');
};

/**
 * Opens a session.
 * @return A Promise for the completion of the function.
 */
const openSession = async (name: string, externalId: string): Promise<void> => {
    const participant = {
        name: name,
        externalId: externalId,
        avatarUrl: `https://gravatar.com/avatar/${Math.floor(Math.random() * 1000000)}?s=200&d=identicon`,
    };

    // Close the session if it is already opened
    if (VoxeetSDK.session.participant) {
        await VoxeetSDK.session.close();
    }

    await VoxeetSDK.session.open(participant);
};

/**
 * Close the current session.
 * @return A Promise for the completion of the function.
 */
const closeSession = async (): Promise<void> => {
    await VoxeetSDK.session.close();
};

/**
 * Joins the specified conference.
 * @param conferenceId Conference ID.
 * @param conferenceAccessToken Conference Access Token provided by the backend.
 * @param audio Join with the audio on.
 * @param video Join with the video on.
 * @return A Promise for the completion of the function.
 */
const joinConference = async (conferenceId: string, conferenceAccessToken: string, audio: boolean = true, video: boolean = true): Promise<void> => {
    // Get the conference object
    const conference = await VoxeetSDK.conference.fetch(conferenceId);

    // See: https://dolby.io/developers/interactivity-apis/client-sdk/reference-javascript/model/joinoptions
    const joinOptions = {
        conferenceAccessToken: conferenceAccessToken,
        constraints: {
            audio: audio,
            video: video,
        },
        maxVideoForwarding: 4,
    };

    await VoxeetSDK.conference.join(conference, joinOptions);
};

/**
 * Starts sharing the video to the conference participants.
 * @return A Promise for the completion of the function.
 */
const startVideo = async (): Promise<void> => {
    await VoxeetSDK.conference.startVideo(VoxeetSDK.session.participant, {});
};

/**
 * Stops sharing the video to the conference participants.
 * @return A Promise for the completion of the function.
 */
const stopVideo = async (): Promise<void> => {
    return VoxeetSDK.conference.stopVideo(VoxeetSDK.session.participant);
};

/**
 * Mutes the local participant.
 */
const mute = (): void => {
    VoxeetSDK.conference.mute(VoxeetSDK.session.participant, true);
};

/**
 * Unmutes the local participant.
 */
const unmute = (): void => {
    VoxeetSDK.conference.mute(VoxeetSDK.session.participant, false);
};

/**
 * Leaves the conference.
 */
const leaveConference = async (): Promise<void> => {
    try {
        await VoxeetSDK.conference.leave();
    } catch (error) {
        console.error(error);
    }
};

/**
 * Starts the recording of the podcast.
 */
const startRecording = async (): Promise<void> => {
    await VoxeetSDK.recording.start();
};

/**
 * Stops the recording of the podcast.
 */
const stopRecording = async (): Promise<void> => {
    await VoxeetSDK.recording.stop();
};

/**
 * Inform the other participants that the local recording has started.
 */
const startLocalRecording = async (): Promise<void> => {
    await VoxeetSDK.command.send('Local recording started.');
};

export default {
    initializeSDK,
    openSession,
    closeSession,
    joinConference,
    startVideo,
    stopVideo,
    mute,
    unmute,
    leaveConference,
    startRecording,
    stopRecording,
    startLocalRecording,
};
