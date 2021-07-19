import VoxeetSDK

class PodcastViewModel: LoadableObject {
    
    @Published private (set) var state: LoadingState
    
    @Published private (set) var participants: [String: ParticipantVideoModel]
    
    private let podcastIdentifier: String
    
    init(podcastIdentifier: String) {
        self.state = .idle
        self.participants = [String: ParticipantVideoModel]()
        self.podcastIdentifier = podcastIdentifier
    }

    func load() {
        print("[PodcastViewModel] - Load - \(self.podcastIdentifier)")
        self.state = .loading
        
        // Conference delegate.
        VoxeetSDK.shared.conference.delegate = self
        
        listenToPodcast(podcastIdentifier: self.podcastIdentifier) {
            self.state = .loaded
        } fail: { error in
            self.state = .failed(error)
        }
    }
    
    func refresh() {
        self.objectWillChange.send()
    }
}

class ParticipantVideoModel : ObservableObject {
    
    @Published private (set) var identifier: String
    @Published private (set) var participant: VTParticipant
    @Published private (set) var stream: MediaStream?
    
    init(participant: VTParticipant) {
        self.identifier = participant.id ?? ""
        self.participant = participant
        self.stream = nil
    }
    
    func updateStreams(stream: MediaStream) {
        self.stream = stream
    }
}

extension PodcastViewModel: VTConferenceDelegate {
    func statusUpdated(status: VTConferenceStatus) {
        print("[VTConferenceDelegate] statusUpdated")
    }
    
    func permissionsUpdated(permissions: [Int]) {
        print("[VTConferenceDelegate] permissionsUpdated")
    }
    
    func participantAdded(participant: VTParticipant) {
        print("[VTConferenceDelegate] participantAdded")
        
        if participant.type == .user {
            if let pId = participant.id, let name = participant.info.externalID {
                if name != "producer" { // Filter out the producer
                    if participant.status == .connected || participant.status == .connecting {
                        self.participants[pId] = ParticipantVideoModel(participant: participant)
                    }
                }
            }
        }
    }
    
    func participantUpdated(participant: VTParticipant) {
        print("[VTConferenceDelegate] participantUpdated")
        
        if let pId = participant.id {
            if participant.status != .connected && participant.status != .connecting {
                self.participants[pId] = nil
            }
        }
    }
    
    func streamAdded(participant: VTParticipant, stream: MediaStream) {
        print("[VTConferenceDelegate] streamAdded")
        updateStreams(participant: participant, stream: stream)
        refresh()
    }
    
    func streamUpdated(participant: VTParticipant, stream: MediaStream) {
        print("[VTConferenceDelegate] streamUpdated")
        updateStreams(participant: participant, stream: stream)
        refresh()
    }
    
    func streamRemoved(participant: VTParticipant, stream: MediaStream) {
        print("[VTConferenceDelegate] streamRemoved")
        updateStreams(participant: participant, stream: stream)
        refresh()
    }
    
    func updateStreams(participant: VTParticipant, stream: MediaStream) {
        if participant.type != VTParticipantType.user || stream.type != .Camera {
            return
        }
        
        if let pId = participant.id, let p = self.participants[pId] {
            p.updateStreams(stream: stream)
        }
    }
}
