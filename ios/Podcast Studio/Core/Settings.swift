import Foundation

struct Settings: Codable {
    /** Base URL of the service. */
    var baseUrl: String
    
    /** Load the application settings. */
    static func load() -> Settings {
        if let path = Bundle.main.path(forResource: "Settings", ofType: "plist"),
           let xml = FileManager.default.contents(atPath: path),
           let settings = try? PropertyListDecoder().decode(Settings.self, from: xml)
        {
            return settings
        }
        
        fatalError("Couldn't load the settings.")
    }
}
