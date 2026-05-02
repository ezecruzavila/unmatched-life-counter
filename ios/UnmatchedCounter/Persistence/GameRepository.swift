import Foundation

protocol GameRepository: AnyObject {
    /// When true, the game screen also hides the home indicator / system nav.
    var hideNavigation: Bool { get set }
}

final class UserDefaultsGameRepository: GameRepository {
    private enum Key {
        static let hideNavigation = "unmatched.hideNavigation"
    }

    private let defaults: UserDefaults

    init(defaults: UserDefaults = .standard) {
        self.defaults = defaults
    }

    var hideNavigation: Bool {
        get { defaults.bool(forKey: Key.hideNavigation) }
        set { defaults.set(newValue, forKey: Key.hideNavigation) }
    }
}
