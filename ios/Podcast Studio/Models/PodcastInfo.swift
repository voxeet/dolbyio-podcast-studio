struct PodcastInfo {
    var identifier: String
    var name: String
    var description: String
    var isLive: Bool
}

extension PodcastInfo {
    static var data: [PodcastInfo] {
        [
            PodcastInfo(identifier: "000", name: "Podcast 000", description: "Super podcast 000", isLive: true),
            PodcastInfo(identifier: "001", name: "Podcast 001", description: "Super podcast 001", isLive: false),
            PodcastInfo(identifier: "002", name: "Podcast 002", description: "Super podcast 002", isLive: false),
            PodcastInfo(identifier: "003", name: "Podcast 003", description: "Super podcast 003", isLive: true)
        ]
    }
}
