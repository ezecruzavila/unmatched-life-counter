import Foundation

struct PlayerSetupModel: Equatable {
    let id: Int
    var characterName: String
    var color: PlayerColor
    var startingLifeSegments: [Int]

    init(id: Int = 0,
         characterName: String = UnmatchedCharacters.names.first ?? "",
         color: PlayerColor = .none,
         startingLifeSegments: [Int] = [GameRules.startingLife]) {
        precondition(!startingLifeSegments.isEmpty &&
                     startingLifeSegments.count <= LifeSegmentLimits.maxLifeSegments,
                     "startingLifeSegments must have 1..\(LifeSegmentLimits.maxLifeSegments) values")
        self.id = id
        self.characterName = characterName
        self.color = color
        self.startingLifeSegments = startingLifeSegments
    }
}
