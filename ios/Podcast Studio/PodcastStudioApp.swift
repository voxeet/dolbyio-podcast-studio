import SwiftUI

@main
struct PodcastStudioApp: App {
    
    init() {
        initializeSDK()
    }
    
    var body: some Scene {
        WindowGroup {
            PodcastsView()
        }
    }
}
