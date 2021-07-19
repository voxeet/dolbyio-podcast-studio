// Source: https://www.swiftbysundell.com/articles/handling-loading-states-in-swiftui/

import Foundation

enum LoadingState {
    case idle
    case loading
    case failed(Error?)
    case loaded
}

protocol LoadableObject: ObservableObject {
    var state: LoadingState { get }
    func load()
}
