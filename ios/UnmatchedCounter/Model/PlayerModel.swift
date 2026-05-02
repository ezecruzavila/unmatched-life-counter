import UIKit

struct PlayerModel: Equatable {
    let id: Int
    let characterName: String
    var lifeSegmentLabels: [String]
    var lifeSegmentMaximums: [Int]
    var lifeSegments: [Int]
    var color: PlayerColor

    init(id: Int,
         characterName: String,
         lifeSegmentLabels: [String] = [""],
         lifeSegmentMaximums: [Int] = [0],
         lifeSegments: [Int] = [0],
         color: PlayerColor = .white) {
        precondition(!lifeSegments.isEmpty && lifeSegments.count <= LifeSegmentLimits.maxLifeSegments,
                     "lifeSegments must have 1..\(LifeSegmentLimits.maxLifeSegments) values")
        precondition(lifeSegmentLabels.count == lifeSegments.count,
                     "lifeSegmentLabels must match lifeSegments size")
        precondition(lifeSegmentMaximums.count == lifeSegments.count,
                     "lifeSegmentMaximums must match lifeSegments size")
        self.id = id
        self.characterName = characterName
        self.lifeSegmentLabels = lifeSegmentLabels
        self.lifeSegmentMaximums = lifeSegmentMaximums
        self.lifeSegments = lifeSegments
        self.color = color
    }
}
