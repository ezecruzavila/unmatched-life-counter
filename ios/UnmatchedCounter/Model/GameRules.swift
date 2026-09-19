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
            // Row-major order so the in-game tabletop matches the 2×2 setup
            // grid (P1 top-left, P2 top-right, P3 bottom-left, P4 bottom-right).
            return [.leftPanel1, .rightPanel1, .leftPanel2, .rightPanel2]
        default:
            preconditionFailure("Unsupported player count: \(count)")
        }
    }
}

enum LifeSegmentLimits {
    static let maxLifeSegments: Int = 3
}
