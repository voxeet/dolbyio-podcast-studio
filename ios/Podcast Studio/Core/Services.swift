import Alamofire
import SwiftyJSON
import VoxeetSDK
import UIKit

/**
  Initialize the Voxeet SDK.
 */
func initializeSDK() {
    // Request an access token
    getAccessToken { accessToken in
    
        // Voxeet SDK initialization.
        print("[Info] Initialize the Voxeet SDK")
        VoxeetSDK.shared.initialize(accessToken: accessToken, refreshTokenClosureWithParam: { closure, isExpired in
            // Request a new Access Token
            getAccessToken { newAccessToken in
                closure(newAccessToken)
            } fail: { error in
                closure(nil)
            }
        })
        
    } fail: { error in
        fatalError("Couldn't load access token:\n\(String(describing: error))")
    }
    
    // Example of public variables to change the conference behavior.
    VoxeetSDK.shared.notification.push.type = .none
    VoxeetSDK.shared.conference.defaultBuiltInSpeaker = true
    VoxeetSDK.shared.conference.defaultVideo = false
}

func openSession(externalID: String, name: String, avatarURL: String?, success: @escaping (() -> Void), fail: @escaping ((_ error: Error?) -> Void)) {
    print("[Info] Open a session for [name: \(name); externalId: \(externalID)]")
    
    let info = VTParticipantInfo(externalID: externalID, name: name, avatarURL: avatarURL)
    
    VoxeetSDK.shared.session.open(info: info) { error in
        if (error == nil) {
            success()
        } else {
            fail(error)
        }
    }
}

func getPodcasts(success: @escaping ((_ podcasts: [PodcastInfo]) -> Void), fail: @escaping ((_ error: Error?) -> Void)) {
    print("[Info] List the podcasts from the server")
    
    let settings: Settings = Settings.load()
    let url = "\(settings.baseUrl)/list/"
    AF.request(url).validate().responseJSON { response in
        switch response.result {
        case .success(let data):
            var podcasts = [PodcastInfo]()
            
            let json = JSON(data)
            for (_, jsonObj) in json {
                let pi = PodcastInfo(
                    identifier: jsonObj["identifier"].stringValue,
                    name: jsonObj["podcastName"].stringValue,
                    description: jsonObj["podcastDescription"].stringValue,
                    isLive: jsonObj["isLive"].boolValue)
                podcasts.append(pi)
            }
            
            debugPrint("Podcasts: \(podcasts)")
            success(podcasts)
        case .failure(let error):
            print("Something went wrong: \(error)")
            fail(error as Error?)
        }
    }
}

func listenToPodcast(podcastIdentifier: String, success: @escaping (() -> Void), fail: @escaping ((_ error: Error?) -> Void)) {
    // Get an invitation for the podcast
    getInvitation(podcastIdentifier: podcastIdentifier, success: { invitation in
        
        // Fetch the conference object
        VoxeetSDK.shared.conference.fetch(conferenceID: podcastIdentifier) { conference in
            
            // Set the Conference Access Token
            let options: VTListenOptions = VTListenOptions()
            options.conferenceAccessToken = invitation.accessToken
            
            // Join the conference with its id.
            VoxeetSDK.shared.conference.listen(conference: conference, options: options, success: { response in
                print("conference joined")
                success()
            }, fail: { error in
                fail(error)
            })
            
        }
        
    }, fail: fail)
}

func getInvitation(podcastIdentifier: String, success: @escaping ((_ invitation: Invitation) -> Void), fail: @escaping ((_ error: Error?) -> Void)) {
    if let externalID = VoxeetSDK.shared.session.participant?.info.externalID {
        getInvitation(podcastIdentifier: podcastIdentifier, externalID: externalID, success: success, fail: fail)
    } else {
        let rand = Int.random(in: 0...10000)
        let externalID = "listener-\(rand)"
        let name = "Listener #\(rand)"
        
        openSession(externalID: externalID, name: name, avatarURL: nil, success: { () in
            getInvitation(podcastIdentifier: podcastIdentifier, externalID: externalID, success: success, fail: fail)
        }, fail: fail)
    }
}

/**
 Leaves the current podcast.
 - parameter completion: A block object to be executed when the server connection sequence ends. This block has no return value and takes a single Error argument that indicates whether or not the connection to the server succeeded.
 */
func leavePodcast(completion: @escaping ((_ error: Error?) -> Void)) {
    VoxeetSDK.shared.conference.leave(completion: completion)
}


private func getAccessToken(success: @escaping ((_ accessToken: String) -> Void), fail: @escaping ((_ error: Error?) -> Void)) {
    print("[Info] Request an Access Token for the Voxeet SDK")
    
    let settings: Settings = Settings.load()
    let url = "\(settings.baseUrl)/access-token/"
    AF.request(url).validate().responseJSON { response in
        switch response.result {
        case .success(let data):
            let json = JSON(data)
            if let accessToken = json["access_token"].string {
                debugPrint("Access Token: \(accessToken)")
                success(accessToken)
            } else {
                let error = NSError(domain: "", code: 0, userInfo: [NSLocalizedDescriptionKey : "Invalid JWT Token"])
                fail(error)
            }
        case .failure(let error):
            print("Something went wrong: \(error)")
            fail(error as Error?)
        }
    }
}

private func getInvitation(podcastIdentifier: String, externalID: String, success: @escaping ((_ invitation: Invitation) -> Void), fail: @escaping ((_ error: Error?) -> Void)) {
    print("[Info] Request an invitation to join the podcast")
    
    struct GetInvitation: Encodable {
        let podcastIdentifier: String
        let externalId: String
        let isListener: Bool
    }

    let getInvitation = GetInvitation(
        podcastIdentifier: podcastIdentifier,
        externalId: externalID,
        isListener: true)
    
    let settings: Settings = Settings.load()
    let url = "\(settings.baseUrl)/invitation/"
    AF.request(url,
               method: .post,
               parameters: getInvitation,
               encoder: JSONParameterEncoder.default).validate().responseJSON { response in
        switch response.result {
        case .success(let data):
            let json = JSON(data)
            
            let invitation = Invitation(
                identifier: json["identifier"].stringValue,
                name: json["name"].stringValue,
                description: json["description"].stringValue,
                accessToken: json["accessToken"].stringValue)
            
            debugPrint("Invitation: \(invitation)")
            success(invitation)
        case .failure(let error):
            print("Something went wrong: \(error)")
            fail(error as Error?)
        }
    }
}
