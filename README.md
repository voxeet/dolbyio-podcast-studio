# :warning: This repository is no longer maintained :warning:

# Dolby.io - Podcast Studio

## Web Application

Here is the list of what you can do in this application:

-   Producer role creates a podcast (conference), starts and stops the recording
-   Host application for the participants of the podcast
-   Local audio recording for post processing for the podcast participants
-   Use [Enhanced Conference Access Control](https://dolby.io/developers/interactivity-apis/guides/enhanced-conference-access-control) with the permissions set on the server side

### Setup

Create a `.env` file at the root of the `web` folder and insert your consumer key and secret like that:

```
CONSUMER_KEY=<Your consumer key>
CONSUMER_SECRET=<Your consumer secret>
LIVE_RECORDING=false
```

The *LIVE_RECORDING* variable will define how you want to set the [liveRecording](https://docs.dolby.io/interactivity/reference/conference#postconferencecreate) property when creating a new conference.

Install all the required packages with the command:

```bash
npm install
```

### Build and run

Build the **producer** application with the command:

```bash
npm run build:producer
```

Build the **host** application with the command:

```bash
npm run build:host
```

Start the server with the command:

```bash
npm run start
```

You can now access the producer web application at this URL `http://localhost:8081/producer` and create a podcast. Then access the host web application at `http://localhost:8081/host` and join the podcast you have just created.

### Docker

The project also provides an easy way to deploy this sample project using a Docker image. Build your image using the command:

```bash
docker build -t dolbyio-samples-podcast:latest .
```

And run the image using the command:

```bash
docker run \
    --rm \
    -it \
    -p 80:8081/tcp \
    --env "CONSUMER_KEY=<YOUR_CONSUMER_KEY>" \
    --env "CONSUMER_SECRET=<YOUR_CONSUMER_SECRET>" \
    dolbyio-samples-podcast:latest
```

## iOS Application - Listener

The iOS Application, in the [ios](ios) folder of this repo is a listen-only client, written in SwiftUI. It allows to list the podcasts that are running live and join them.

Run the following command to install the pods:

```bash
pod install
```

Open the file `.xcworkspace`. In Xcode, open the file `Settings.plist` and for the setting *baseUrl*, provide the URL of the web server you use to host the service.


## Open Source Projects

This sample application is using the following Open Source projects:

-   [Bootstrap](https://getbootstrap.com)
-   [FontAwesome](https://fontawesome.com)
-   [Google Fonts](https://fonts.google.com)
-   [JQuery](https://jquery.com)
-   [RecordRTC](https://github.com/muaz-khan/RecordRTC)

## Images Attribution

Icons made by [Smashicons](https://www.flaticon.com/authors/smashicons) and [Freepik](https://www.freepik.com) from [www.flaticon.com](https://www.flaticon.com/).
