import UIKit

/// Mirrors the Android PlayerColor enum. Order is preserved so
/// the default sort order matches the original app.
enum PlayerColor: Int, CaseIterable {
    case none = 0
    case blue
    case red
    case turkwise
    case purple
    case orange
    case green
    case indigo
    case lightGreen
    case pink
    case white

    /// Stable identifier matching `colorId` from the Android enum, used for persistence.
    var colorId: Int64 {
        switch self {
        case .none:       return 0
        case .blue:       return 13
        case .red:        return 4
        case .turkwise:   return 1
        case .purple:     return 8
        case .orange:     return 5
        case .green:      return 7
        case .indigo:     return 2
        case .lightGreen: return 6
        case .pink:       return 3
        case .white:      return 14
        }
    }

    /// Asset-catalog color name (nil for `.none`, which has no fill).
    var assetName: String? {
        switch self {
        case .none:       return nil
        case .blue:       return "accent_blue"
        case .red:        return "light_red"
        case .turkwise:   return "turkwise"
        case .purple:     return "cool_purple"
        case .orange:     return "light_orange"
        case .green:      return "green"
        case .indigo:     return "indigo"
        case .lightGreen: return "light_green"
        case .pink:       return "light_pink"
        case .white:      return "white"
        }
    }

    var uiColor: UIColor {
        guard let name = assetName, let c = UIColor(named: name) else { return .white }
        return c
    }

    static func allColors() -> [PlayerColor] {
        return PlayerColor.allCases.filter { $0 != .none }
    }

    static func randomColors(amount: Int) -> [PlayerColor] {
        return Array(allColors().shuffled().prefix(amount))
    }
}
