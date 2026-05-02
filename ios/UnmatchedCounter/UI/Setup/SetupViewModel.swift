import Foundation

/// State container for the Setup screen. Plays the role of the Android
/// `SetupViewModel` (LiveData replaced with closure callbacks because we
/// can't depend on Combine on iOS 12).
final class SetupViewModel {

    /// We always keep four player slots in memory so toggling 4 → 2 → 4
    /// preserves the user's choices, exactly like the Android version.
    static let playerCount: Int = GameRules.maxPlayerCount

    private let repository: GameRepository

    /// All four setup slots (always length == `playerCount`).
    private(set) var setupPlayers: [PlayerSetupModel] = [] {
        didSet { onPlayersChanged?(setupPlayers) }
    }

    /// How many of the four slots are active in the current game (2 or 4).
    private(set) var activePlayerCount: Int = GameRules.maxPlayerCount {
        didSet { onActivePlayerCountChanged?(activePlayerCount) }
    }

    var hideNavigation: Bool {
        get { repository.hideNavigation }
        set { repository.hideNavigation = newValue }
    }

    var onPlayersChanged: (([PlayerSetupModel]) -> Void)?
    var onActivePlayerCountChanged: ((Int) -> Void)?

    init(repository: GameRepository) {
        self.repository = repository
        rebuildPlayerList()
    }

    func refresh() {
        rebuildPlayerList()
    }

    func setPlayerCharacter(playerId: Int, characterName: String) {
        guard (0..<SetupViewModel.playerCount).contains(playerId),
              UnmatchedCharacters.names.contains(characterName) else { return }
        setupPlayers = setupPlayers.map { player in
            guard player.id == playerId else { return player }
            var updated = player
            updated.characterName = characterName
            updated.startingLifeSegments = UnmatchedCharacters.startingLifeSegments(for: characterName)
            return updated
        }
    }

    func setActivePlayerCount(_ count: Int) {
        guard GameRules.supportedPlayerCounts.contains(count) else { return }
        guard activePlayerCount != count else { return }
        activePlayerCount = count
    }

    func findSetupPlayer(byId id: Int) -> PlayerSetupModel? {
        return setupPlayers.first { $0.id == id }
    }

    /// Only the active players (according to `activePlayerCount`) are sent to the game.
    func playersForGame() -> [PlayerSetupModel] {
        return setupPlayers.prefix(activePlayerCount).map { player in
            var p = player
            p.startingLifeSegments = UnmatchedCharacters.startingLifeSegments(for: player.characterName)
            return p
        }
    }

    private func rebuildPlayerList() {
        let target = SetupViewModel.playerCount
        var newList = setupPlayers.prefix(target).map { player -> PlayerSetupModel in
            var p = player
            p.startingLifeSegments = UnmatchedCharacters.startingLifeSegments(for: p.characterName)
            return p
        }
        let palette = PlayerColor.allColors()
        while newList.count < target {
            let i = newList.count
            let name = defaultCharacterName(forIndex: i)
            let color = palette.first { c in newList.allSatisfy { $0.color != c } } ?? .none
            newList.append(PlayerSetupModel(
                id: i,
                characterName: name,
                color: color,
                startingLifeSegments: UnmatchedCharacters.startingLifeSegments(for: name)
            ))
        }
        setupPlayers = newList
    }

    private func defaultCharacterName(forIndex index: Int) -> String {
        let names = UnmatchedCharacters.names
        if names.isEmpty { return "" }
        return names[min(index, names.count - 1)]
    }
}
