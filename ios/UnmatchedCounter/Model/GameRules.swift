import Foundation

enum TableLayoutPosition {
    case soloPanel
    case topPanel
    case bottomPanel
    case leftPanel1
    case leftPanel2
    case leftPanel3
    case rightPanel1
    case rightPanel2
    case rightPanel3
}

enum GameRules {
    static let startingLife: Int = 15
    static let minPlayerCount: Int = 2
    static let maxPlayerCount: Int = 4
    static let supportedPlayerCounts: [Int] = [2, 4]

    static func tabletopPositions(forPlayerCount count: Int) -> [TableLayoutPosition] {
        switch count {
        case 2:
            return [.topPanel, .bottomPanel]
        case 4:
            return [.leftPanel1, .leftPanel2, .rightPanel1, .rightPanel2]
        default:
            preconditionFailure("Unsupported player count: \(count)")
        }
    }
}

enum LifeSegmentLimits {
    static let maxLifeSegments: Int = 3
}
