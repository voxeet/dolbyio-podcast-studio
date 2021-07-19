import express from 'express';
import dotenv from 'dotenv';
import net from 'net';
import https from 'https';
import http from 'http';
import { Command } from 'commander';

dotenv.config();
const app = express();
const program = new Command();

// Parse POST requests as JSON payload
app.use(express.json());

// Serve static files
app.use(express.static('dist'));

const CONSUMER_KEY = process.env.CONSUMER_KEY ?? '';
const CONSUMER_SECRET = process.env.CONSUMER_SECRET ?? '';
const LIVE_RECORDING = process.env.LIVE_RECORDING === 'true';

if (CONSUMER_KEY.length <= 0 || CONSUMER_SECRET.length <= 0) {
    throw new Error('The Consumer Key and/or Secret are missing!');
}

interface JwtToken {
    access_token: string;
}

enum InvitationProfile {
    listener,
    host,
    producer,
}

interface Podcast {
    identifier: string;
    podcastName: string;
    podcastDescription: string;
    isLive: boolean;
}

const podcasts: Map<string, Podcast> = new Map();

/**
 * Sends a POST request
 *
 * @param method
 * @param hostname
 * @param path
 * @param headers
 * @param body
 *
 * @returns A JSON payload object through a Promise.
 */
const sendRequestAsync = (method: string, hostname: string, path: string, headers: http.OutgoingHttpHeaders, body?: string) => {
    return new Promise(function (resolve, reject) {
        const options: https.RequestOptions = {
            hostname: hostname,
            port: 443,
            path: path,
            method: method,
            headers: headers,
        };

        const req = https.request(options, (res) => {
            console.log(`[${method}] ${res.statusCode} - https://${hostname}${path}`);

            let data = '';
            res.on('data', (chunk) => {
                data = data + chunk.toString();
            });

            res.on('end', () => {
                if (data.length > 0) {
                    const json = JSON.parse(data);
                    resolve(json);
                } else {
                    resolve(null);
                }
            });
        });

        req.on('error', (error) => {
            console.error('error', error);
            reject(error);
        });

        if (body && body.length > 0) {
            req.write(body);
        }

        req.end();
    });
};

/**
 * Sends a POST request
 *
 * @param hostname
 * @param path
 * @param headers
 * @param body
 *
 * @returns A JSON payload object through a Promise.
 */
const postAsync = (hostname: string, path: string, headers: http.OutgoingHttpHeaders, body: string) => {
    return sendRequestAsync('POST', hostname, path, headers, body);
};

/**
 * Sends a GET request
 *
 * @param hostname
 * @param path
 * @param headers
 *
 * @returns A JSON payload object through a Promise.
 */
const getAsync = (hostname: string, path: string, headers: http.OutgoingHttpHeaders) => {
    return sendRequestAsync('GET', hostname, path, headers);
};

/**
 * Sends a DELETE request
 *
 * @param hostname
 * @param path
 * @param headers
 *
 * @returns A JSON payload object through a Promise.
 */
const deleteAsync = (hostname: string, path: string, headers: http.OutgoingHttpHeaders) => {
    return sendRequestAsync('DELETE', hostname, path, headers);
};

/**
 * Gets a JWT token for authorization.
 *
 * @param hostname
 * @param path
 *
 * @returns a JWT token.
 */
const getAccessTokenAsync = (hostname: string, path: string): Promise<JwtToken> => {
    const body = 'grant_type=client_credentials';

    const authz = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString('base64');

    const headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cache-Control': 'no-cache',
        Authorization: `Basic ${authz}`,
        'Content-Length': body.length,
    };

    return postAsync(hostname, path, headers, body) as Promise<JwtToken>;
};

// See: https://dolby.io/developers/interactivity-apis/reference/rest-apis/authentication#operation/postOAuthToken
const getClientAccessTokenAsync = (): Promise<JwtToken> => {
    console.log('Get Client Access Token');
    return getAccessTokenAsync('session.voxeet.com', '/v1/oauth2/token');
};

// See: https://dolby.io/developers/interactivity-apis/reference/rest-apis/authentication#operation/JWT
const getAPIAccessTokenAsync = (): Promise<JwtToken> => {
    console.log('Get API Access Token');
    return getAccessTokenAsync('api.voxeet.com', '/v1/auth/token');
};

// See: https://dolby.io/developers/interactivity-apis/reference/rest-apis/conference#operation/postConferenceCreate
const createConferenceAsync = async (ownerExternalId: string, podcastName: string, podcastDescription: string): Promise<any> => {
    const body = JSON.stringify({
        alias: podcastName,
        parameters: {
            dolbyVoice: true,
            liveRecording: LIVE_RECORDING,
        },
        ownerExternalId: ownerExternalId,
    });

    const jwt = await getAPIAccessTokenAsync();

    const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwt.access_token}`,
        'Content-Length': body.length,
    };

    const conference: any = await postAsync('api.voxeet.com', '/v2/conferences/create', headers, body);

    if (conference.ownerToken == null) {
        // When the conference already exists, the ownerToken is not returned
        const accessToken = await getConferenceAccessTokenAsync(conference.conferenceId, ownerExternalId, InvitationProfile.producer);
        conference.ownerToken = accessToken;
    }

    // Save the podcast
    podcasts.set(conference.conferenceId, { identifier: conference.conferenceId, podcastName, podcastDescription, isLive: true });

    return conference;
};

// See: https://dolby.io/developers/interactivity-apis/reference/rest-apis/conference#operation/postConferenceInvite
const getConferenceAccessTokenAsync = async (conferenceId: string, externalId: string, invitationProfile: InvitationProfile): Promise<string> => {
    // "INVITE", "JOIN", "SEND_AUDIO", "SEND_VIDEO", "SHARE_SCREEN",
    // "SHARE_VIDEO", "SHARE_FILE", "SEND_MESSAGE", "RECORD", "STREAM",
    // "KICK", "UPDATE_PERMISSIONS"

    const participants = {};
    switch (invitationProfile) {
        case InvitationProfile.listener:
            participants[externalId] = {
                permissions: ['JOIN'],
            };
            break;
        case InvitationProfile.host:
            participants[externalId] = {
                permissions: ['JOIN', 'SEND_AUDIO', 'SEND_VIDEO', 'SEND_MESSAGE'],
            };
            break;
        case InvitationProfile.producer:
            participants[externalId] = {
                permissions: [
                    'INVITE',
                    'JOIN',
                    'SEND_AUDIO',
                    'SEND_VIDEO',
                    'SHARE_SCREEN',
                    'SHARE_VIDEO',
                    'SHARE_FILE',
                    'SEND_MESSAGE',
                    'RECORD',
                    'STREAM',
                    'KICK',
                    'UPDATE_PERMISSIONS',
                ],
            };
            break;

        default:
            break;
    }

    const body = JSON.stringify({
        participants: participants,
    });

    const jwt = await getAPIAccessTokenAsync();

    const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwt.access_token}`,
        'Content-Length': body.length,
    };

    const accessTokens = await postAsync('api.voxeet.com', `/v2/conferences/${conferenceId}/invite`, headers, body);
    return accessTokens[externalId];
};

const getConferenceAsync = async (conferenceId: string): Promise<any> => {
    const jwt = await getAPIAccessTokenAsync();

    const headers = {
        Authorization: `Bearer ${jwt.access_token}`,
    };

    return await getAsync('api.voxeet.com', `/v1/monitor/conferences/${conferenceId}?livestats=false`, headers);
};

// See: https://dolby.io/developers/interactivity-apis/reference/rest-apis/conference#operation/deleteConference
const terminateConferenceAsync = async (conferenceId: string) => {
    const jwt = await getAPIAccessTokenAsync();

    const headers = {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + jwt.access_token,
    };

    await deleteAsync('api.voxeet.com', `/v2/conferences/${conferenceId}`, headers);

    if (podcasts.has(conferenceId)) {
        podcasts.delete(conferenceId);
    }
};

// See: https://docs.dolby.io/interactivity/reference/streaming#postrtmpstart
const startStreamingConference = async (conferenceId: string, rtmpUrl: string): Promise<void> => {
    const body = JSON.stringify({
        uri: rtmpUrl,
    });

    const jwt = await getAPIAccessTokenAsync();

    const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwt.access_token}`,
        'Content-Length': body.length,
    };

    await postAsync('api.voxeet.com', `/v2/conferences/mix/${conferenceId}/rtmp/start`, headers, body);
};

// See: https://docs.dolby.io/interactivity/reference/streaming#postrtmpstop
const stopStreamingConference = async (conferenceId: string): Promise<void> => {
    const jwt = await getAPIAccessTokenAsync();

    const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwt.access_token}`,
        'Content-Length': 0,
    };

    await postAsync('api.voxeet.com', `/v2/conferences/mix/${conferenceId}/rtmp/start`, headers, '');
};

app.get('/access-token', async function (request, response) {
    console.log(`[GET] ${request.url}`);

    try {
        const accessToken = await getClientAccessTokenAsync();
        response.set('Content-Type', 'application/json');
        response.status(200).send(JSON.stringify(accessToken, null, '  '));
    } catch (error) {
        console.error(error);
        response.status(500).send('An error happened.');
    }
});

app.post('/conference', async function (request, response) {
    console.log(`[POST] ${request.url}`, request.body);

    const ownerExternalId = request.body.ownerExternalId;
    const podcastName = request.body.podcastName;
    const podcastDescription = request.body.podcastDescription;

    try {
        const conference = await createConferenceAsync(ownerExternalId, podcastName, podcastDescription);
        response.set('Content-Type', 'application/json');
        response.status(201).send(JSON.stringify(conference, null, '  '));
    } catch (error) {
        console.error(error);
        response.status(500).send('An error happened.');
    }
});

app.post('/invitation', async function (request, response) {
    console.log(`[POST] ${request.url}`, request.body);

    const podcastIdentifier = request.body.podcastIdentifier;
    const externalId = request.body.externalId;
    const isListener = request.body.isListener;

    try {
        const conference = await getConferenceAsync(podcastIdentifier);
        const hasPodcast = podcasts.has(podcastIdentifier);
        if (!conference || !hasPodcast) {
            const message = `The podcast ${podcastIdentifier} cannot be found.`;
            console.log(message);
            response.status(404).send(message);
            return;
        }

        const podcast = podcasts.get(podcastIdentifier);
        const invitationProfile: InvitationProfile = isListener ? InvitationProfile.listener : InvitationProfile.host;
        const accessToken = await getConferenceAccessTokenAsync(podcastIdentifier, externalId, invitationProfile);

        response.set('Content-Type', 'application/json');
        response.status(200).send(
            JSON.stringify(
                {
                    identifier: podcastIdentifier,
                    name: podcast.podcastName,
                    description: podcast.podcastDescription,
                    accessToken: accessToken,
                },
                null,
                '  '
            )
        );
    } catch (error) {
        console.error(error);
        response.status(500).send('An error happened.');
    }
});

app.delete('/conference/:conferenceId', async function (request, response) {
    console.log(`[DELETE] ${request.url}`);

    const conferenceId = request.params.conferenceId;

    try {
        await terminateConferenceAsync(conferenceId);
        response.status(200).send('Ok');
    } catch (error) {
        console.error(error);
        response.status(500).send('An error happened.');
    }
});

app.get('/list', function (_, response) {
    try {
        let result = [];
        podcasts.forEach((value) => result.push(value));

        response.set('Content-Type', 'application/json');
        response.status(200).send(JSON.stringify(result, null, '  '));
    } catch (error) {
        console.error(error);
        response.status(500).send('An error happened.');
    }
});

app.post('/stream/:conferenceId/start', async function (request, response) {
    console.log(`[POST] ${request.url}`);

    const conferenceId = request.params.conferenceId;
    const rtmpUrl = request.body.rtmpUrl;
    console.log(`RTMP Url: ${rtmpUrl}`);

    try {
        await startStreamingConference(conferenceId, rtmpUrl);
        response.status(200).send('Ok');
    } catch (error) {
        console.error(error);
        response.status(500).send('An error happened.');
    }
});

app.post('/stream/:conferenceId/stop', async function (request, response) {
    console.log(`[POST] ${request.url}`);

    const conferenceId = request.params.conferenceId;

    try {
        await stopStreamingConference(conferenceId);
        response.status(200).send('Ok');
    } catch (error) {
        console.error(error);
        response.status(500).send('An error happened.');
    }
});

// Extract the port number from the command argument
program.option('-p, --port <portNumber>', 'Port number to start the HTTP server on.');
program.parse(process.argv);

let portNumber = 8081; // Default port number
const options = program.opts();
if (options.port) {
    const p = parseInt(options.port, 10);
    if (!isNaN(p)) {
        portNumber = p;
    }
}

// Starts an HTTP server
const server = app.listen(portNumber, function () {
    const address = server.address() as net.AddressInfo;
    console.log('GitHub repo: https://github.com/dolbyio-samples/dolbyio-podcast-studio');
    console.log('Dolby.io Podcast Studio application is now listening at http://%s:%s', address.address, address.port);
});
