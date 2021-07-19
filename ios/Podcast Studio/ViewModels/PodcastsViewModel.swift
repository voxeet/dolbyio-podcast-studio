import Foundation

class PodcastsViewModel: LoadableObject {
    
    @Published private (set) var state: LoadingState
    @Published private (set) var podcastInfos: [PodcastInfo]
    
    init() {
        self.state = .idle
        self.podcastInfos = [PodcastInfo]()
    }

    func load() {
        self.state = .loading
        
        getPodcasts(success: { podcastInfos in
            self.podcastInfos = podcastInfos
            self.state = .loaded
        }, fail: { error in
            // Report an error.
            self.state = .failed(error)
        })
    }
}
