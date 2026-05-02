import Foundation

/// View model for the Game screen. Tracks per-player life pools and exposes
/// a single `onPlayersChanged` callback because we don't have Combine
/// available on iOS 12.
final class GameViewModel {

    let playerCount: Int

    private let setupPlayers: [PlayerSetupModel]
    private let repository: GameRepository
    private(set) var players: [PlayerModel] = []

    var onPlayersChanged: (([PlayerModel]) -> Void)?

    var hideNavigation: Bool {
        get { repository.hideNavigation }
        set { repository.hideNavigation = newValue }
    }

    init(setupPlayers: [PlayerSetupModel], repository: GameRepository) {
        self.setupPlayers = setupPlayers
        self.playerCount = setupPlayers.count
        self.repository = repository
        initializePlayers()
    }

    func resetGame() {
        initializePlayers()
    }

    func incrementLife(playerId: Int, lifeDifference: Int = 1, segmentIndex: Int = 0) {
        guard let idx = players.firstIndex(where: { $0.id == playerId }) else { return }
        var p = players[idx]
        guard p.lifeSegments.indices.contains(segmentIndex) else { return }
        let cap = p.lifeSegmentMaximums[segmentIndex]
        let proposed = p.lifeSegments[segmentIndex] + lifeDifference
        let newValue = Swift.max(0, Swift.min(proposed, cap))
        p.lifeSegments[segmentIndex] = newValue
        players[idx] = p
        onPlayersChanged?(players)
    }

    private func initializePlayers() {
        players = setupPlayers.map { setup in
            let segments = setup.startingLifeSegments
            let labels = UnmatchedCharacters.segmentLabels(for: setup.characterName)
            return PlayerModel(
                id: setup.id,
                characterName: setup.characterName,
                lifeSegmentLabels: labels,
                lifeSegmentMaximums: segments,
                lifeSegments: segments,
                color: setup.color == .none ? .white : setup.color
            )
        }
        onPlayersChanged?(players)
    }
}
