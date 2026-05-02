import UIKit

/// Catalog of playable Unmatched characters for the four life-counter seats.
/// Mirrors `UnmatchedCharacters.kt` from the Android source: each fighter has
/// 1..3 life pools, per-pool labels, panel art, avatar art, and a UI accent.
enum UnmatchedCharacters {

    private struct Fighter {
        let displayName: String
        let segmentLabels: [String]
        let backgroundAsset: String
        let avatarAsset: String
        let startingLifeSegments: [Int]
        let setupAccentHex: UInt32
    }

    private static let fighters: [Fighter] = [
        Fighter(displayName: "Geralt & Dendelion",
                segmentLabels: ["GERALT", "DENDELION"],
                backgroundAsset: "bg_geralt", avatarAsset: "avatar_geralt",
                startingLifeSegments: [16, 5], setupAccentHex: 0x309894),
        Fighter(displayName: "Bigfoot & Jackalope",
                segmentLabels: ["BIGFOOT", "JACKALOPE"],
                backgroundAsset: "bg_bigfoot", avatarAsset: "avatar_bigfoot",
                startingLifeSegments: [16, 6], setupAccentHex: 0xF0B586),
        Fighter(displayName: "Bruce Lee",
                segmentLabels: ["BRUCE LEE"],
                backgroundAsset: "bg_brucelee", avatarAsset: "avatar_brucelee",
                startingLifeSegments: [14], setupAccentHex: 0xECBD49),
        Fighter(displayName: "Syndra",
                segmentLabels: ["SYNDRA"],
                backgroundAsset: "bg_syndra", avatarAsset: "avatar_syndra",
                startingLifeSegments: [14], setupAccentHex: 0x3D25A8),
        Fighter(displayName: "Taskmaster",
                segmentLabels: ["TASKMASTER"],
                backgroundAsset: "bg_taskmaster", avatarAsset: "avatar_taskmaster",
                startingLifeSegments: [16], setupAccentHex: 0xFF8B33),
        Fighter(displayName: "Muldoon & Workers",
                segmentLabels: ["MULDOON"],
                backgroundAsset: "bg_muldoon", avatarAsset: "avatar_muldoon",
                startingLifeSegments: [14], setupAccentHex: 0xE39139),
        Fighter(displayName: "Chupacabras",
                segmentLabels: ["CHUPACABRAS"],
                backgroundAsset: "bg_chupacabras", avatarAsset: "avatar_chupacabras",
                startingLifeSegments: [14], setupAccentHex: 0xC0C565),
        Fighter(displayName: "Raptors",
                segmentLabels: ["BLUE", "ECHO", "CHARLIE"],
                backgroundAsset: "bg_raptors", avatarAsset: "avatar_raptors",
                startingLifeSegments: [7, 7, 7], setupAccentHex: 0xAF9E49),
        Fighter(displayName: "Eredin",
                segmentLabels: ["EREDIN"],
                backgroundAsset: "bg_eredin", avatarAsset: "avatar_eredin",
                startingLifeSegments: [14], setupAccentHex: 0x2E302D),
        Fighter(displayName: "Bullseye",
                segmentLabels: ["BULLSEYE"],
                backgroundAsset: "bg_bullseye", avatarAsset: "avatar_bullseye",
                startingLifeSegments: [14], setupAccentHex: 0x5876A1),
        Fighter(displayName: "Houdini & Bess",
                segmentLabels: ["HOUDINI", "BESS"],
                backgroundAsset: "bg_houdini", avatarAsset: "avatar_houdini",
                startingLifeSegments: [14, 5], setupAccentHex: 0xC6AD5A),
        Fighter(displayName: "Daredevil",
                segmentLabels: ["DAREDEVIL"],
                backgroundAsset: "bg_daredevil", avatarAsset: "avatar_daredevil",
                startingLifeSegments: [17], setupAccentHex: 0x770A08),
        Fighter(displayName: "Loki",
                segmentLabels: ["LOKI"],
                backgroundAsset: "bg_loki", avatarAsset: "avatar_loki",
                startingLifeSegments: [16], setupAccentHex: 0x354932),
        Fighter(displayName: "Sherlock & Dr.Watson",
                segmentLabels: ["SHERLOCK", "DR. WATSON"],
                backgroundAsset: "bg_sherlock", avatarAsset: "avatar_sherlock",
                startingLifeSegments: [16, 8], setupAccentHex: 0xFFC03F),
        Fighter(displayName: "Elektra",
                segmentLabels: ["ELEKTRA"],
                backgroundAsset: "bg_elektra", avatarAsset: "avatar_elektra",
                startingLifeSegments: [8], setupAccentHex: 0x770A08),
        Fighter(displayName: "Zed",
                segmentLabels: ["ZED"],
                backgroundAsset: "bg_zed", avatarAsset: "avatar_zed",
                startingLifeSegments: [15], setupAccentHex: 0x770A08),
        Fighter(displayName: "Arthur & Merlin",
                segmentLabels: ["KING ARTHUR", "MERLIN"],
                backgroundAsset: "bg_kingarthur", avatarAsset: "avatar_arthur",
                startingLifeSegments: [18, 7], setupAccentHex: 0x2E302D),
        Fighter(displayName: "Medusa",
                segmentLabels: ["MEDUSA"],
                backgroundAsset: "bg_medusa", avatarAsset: "avatar_medusa",
                startingLifeSegments: [16], setupAccentHex: 0x354932),
        Fighter(displayName: "Alice & Jabberwock",
                segmentLabels: ["ALICE", "JABBERWOCK"],
                backgroundAsset: "bg_alicia", avatarAsset: "avatar_alice",
                startingLifeSegments: [13, 8], setupAccentHex: 0x5876A1),
        Fighter(displayName: "Sinbad & The Porter",
                segmentLabels: ["SINBAD", "PORTER"],
                backgroundAsset: "bg_simbad", avatarAsset: "avatar_simbad",
                startingLifeSegments: [15, 6], setupAccentHex: 0xF0B586),
    ]

    private static let byName: [String: Fighter] = {
        var d: [String: Fighter] = [:]
        for f in fighters {
            precondition(f.startingLifeSegments.count == f.segmentLabels.count,
                         "Fighter \(f.displayName) has mismatched pools/labels")
            precondition(!f.startingLifeSegments.isEmpty && f.startingLifeSegments.count <= LifeSegmentLimits.maxLifeSegments,
                         "Fighter \(f.displayName) must have 1..\(LifeSegmentLimits.maxLifeSegments) pools")
            d[f.displayName] = f
        }
        return d
    }()

    /// All character names in catalog order.
    static let names: [String] = fighters.map { $0.displayName }

    /// All character names sorted alphabetically (case-insensitive), for pickers.
    static let sortedNames: [String] = names.sorted {
        $0.compare($1, options: .caseInsensitive) == .orderedAscending
    }

    static func setupAccentColor(for characterName: String) -> UIColor {
        guard let f = byName[characterName] else {
            preconditionFailure("Unknown character: \(characterName)")
        }
        return UIColor(rgbHex: f.setupAccentHex)
    }

    static func startingLifeSegments(for characterName: String) -> [Int] {
        guard let f = byName[characterName] else {
            preconditionFailure("Unknown character: \(characterName)")
        }
        return f.startingLifeSegments
    }

    static func segmentLabels(for characterName: String) -> [String] {
        guard let f = byName[characterName] else {
            preconditionFailure("Unknown character: \(characterName)")
        }
        return f.segmentLabels
    }

    static func avatarImage(for characterName: String) -> UIImage? {
        guard let f = byName[characterName] else { return nil }
        return UIImage(named: f.avatarAsset)
    }

    /// Falls back to a deterministic art slot based on the player id when the
    /// character is unknown (mirrors the Android implementation).
    static func backgroundImage(for characterName: String, playerIdForFallback: Int) -> UIImage? {
        let resolvedName: String
        if byName[characterName] != nil {
            resolvedName = characterName
        } else if !names.isEmpty {
            let idx = max(0, min(playerIdForFallback, names.count - 1))
            resolvedName = names[idx]
        } else {
            return nil
        }
        guard let f = byName[resolvedName] else { return nil }
        return UIImage(named: f.backgroundAsset)
    }
}

extension UIColor {
    /// Build a UIColor from a 24-bit RGB packed integer (0xRRGGBB).
    convenience init(rgbHex: UInt32, alpha: CGFloat = 1.0) {
        let r = CGFloat((rgbHex >> 16) & 0xFF) / 255.0
        let g = CGFloat((rgbHex >> 8) & 0xFF) / 255.0
        let b = CGFloat(rgbHex & 0xFF) / 255.0
        self.init(red: r, green: g, blue: b, alpha: alpha)
    }
}
