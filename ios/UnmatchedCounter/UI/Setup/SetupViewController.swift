import UIKit

final class SetupViewController: UIViewController {

    private let viewModel: SetupViewModel

    private let titleLabel = UILabel()
    private let dividerStack = UIStackView()
    private let playerCountLabel = UILabel()
    private let playerCount2Button = UIButton(type: .system)
    private let playerCount4Button = UIButton(type: .system)
    private let centerLogoView = CircleImageView(image: UIImage(named: "ic_setup_center_unmatched"))
    private let startButton = UIButton(type: .system)

    private var cards: [SetupPlayerCardView] = []

    init(viewModel: SetupViewModel = SetupViewModel(repository: UserDefaultsGameRepository())) {
        self.viewModel = viewModel
        super.init(nibName: nil, bundle: nil)
    }

    required init?(coder: NSCoder) { fatalError("init(coder:) is not supported") }

    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = Theme.Color.background
        configureSubviews()
        layoutSubviews()
        bind()
    }

    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        navigationController?.setNavigationBarHidden(true, animated: animated)
        viewModel.refresh()
    }

    private func configureSubviews() {
        titleLabel.text = "Unmatched Life Counter"
        titleLabel.textColor = Theme.Color.textPrimary
        titleLabel.font = Theme.Font.bold(26)
        titleLabel.textAlignment = .center
        view.addSubview(titleLabel)

        let leftLine = UIView()
        leftLine.backgroundColor = Theme.Color.dividerLeft
        let rightLine = UIView()
        rightLine.backgroundColor = Theme.Color.dividerRight
        let diamond = UILabel()
        diamond.text = "◆"
        diamond.textAlignment = .center
        diamond.textColor = Theme.Color.dividerLeft
        leftLine.translatesAutoresizingMaskIntoConstraints = false
        rightLine.translatesAutoresizingMaskIntoConstraints = false
        leftLine.heightAnchor.constraint(equalToConstant: 2).isActive = true
        rightLine.heightAnchor.constraint(equalToConstant: 2).isActive = true

        dividerStack.axis = .horizontal
        dividerStack.alignment = .center
        dividerStack.distribution = .fill
        dividerStack.spacing = 12
        dividerStack.addArrangedSubview(leftLine)
        dividerStack.addArrangedSubview(diamond)
        dividerStack.addArrangedSubview(rightLine)
        view.addSubview(dividerStack)

        playerCountLabel.text = "PLAYERS"
        playerCountLabel.textColor = Theme.Color.textPrimary
        playerCountLabel.font = Theme.Font.bold(17)
        playerCountLabel.textAlignment = .center
        view.addSubview(playerCountLabel)

        configureCountButton(playerCount2Button, title: "2 Players", icon: "👤")
        configureCountButton(playerCount4Button, title: "4 Players", icon: "👥")
        playerCount2Button.addTarget(self, action: #selector(set2Players), for: .touchUpInside)
        playerCount4Button.addTarget(self, action: #selector(set4Players), for: .touchUpInside)
        view.addSubview(playerCount2Button)
        view.addSubview(playerCount4Button)

        // Logo first so the cards' bites reveal it underneath.
        centerLogoView.contentMode = .scaleAspectFill
        view.addSubview(centerLogoView)

        // Each card's bite faces the centre of the 2×2 grid.
        let hubCorners: [SetupHubFacingCorner] = [
            .bottomRight,  // top-left card
            .bottomLeft,   // top-right card
            .topRight,     // bottom-left card
            .topLeft,      // bottom-right card
        ]
        for i in 0..<SetupViewModel.playerCount {
            let card = SetupPlayerCardView(hubFacingCorner: hubCorners[i])
            let index = i
            card.onPickCharacter = { [weak self] in self?.openCharacterPicker(for: index) }
            cards.append(card)
            view.addSubview(card)
        }

        startButton.setTitle("⚔︎  START GAME", for: .normal)
        startButton.titleLabel?.font = Theme.Font.bold(24)
        startButton.setTitleColor(Theme.Color.textPrimary, for: .normal)
        startButton.backgroundColor = Theme.Color.cardFill
        startButton.layer.cornerRadius = 12
        startButton.layer.borderWidth = 2
        startButton.layer.borderColor = Theme.Color.dividerLeft.cgColor
        startButton.addTarget(self, action: #selector(startTapped), for: .touchUpInside)
        view.addSubview(startButton)
    }

    private func configureCountButton(_ button: UIButton, title: String, icon: String) {
        button.setTitle("  \(icon)  \(title)", for: .normal)
        button.setTitleColor(Theme.Color.textPrimary, for: .normal)
        button.titleLabel?.font = Theme.Font.bold(19)
        button.backgroundColor = Theme.Color.countButtonUnselectedFill
        button.layer.cornerRadius = 10
        button.layer.borderWidth = 1
        button.layer.borderColor = Theme.Color.cardBorder.cgColor
    }

    private func layoutSubviews() {
        let safe = view.safeAreaLayoutGuide
        let v: [UIView] = [titleLabel, dividerStack, playerCountLabel, playerCount2Button,
                           playerCount4Button, centerLogoView, startButton] + cards
        v.forEach { $0.translatesAutoresizingMaskIntoConstraints = false }

        NSLayoutConstraint.activate([
            titleLabel.topAnchor.constraint(equalTo: safe.topAnchor, constant: 16),
            titleLabel.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 16),
            titleLabel.trailingAnchor.constraint(equalTo: view.trailingAnchor, constant: -16),

            dividerStack.topAnchor.constraint(equalTo: titleLabel.bottomAnchor, constant: 12),
            dividerStack.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 24),
            dividerStack.trailingAnchor.constraint(equalTo: view.trailingAnchor, constant: -24),

            playerCountLabel.topAnchor.constraint(equalTo: dividerStack.bottomAnchor, constant: 12),
            playerCountLabel.centerXAnchor.constraint(equalTo: view.centerXAnchor),

            playerCount2Button.topAnchor.constraint(equalTo: playerCountLabel.bottomAnchor, constant: 8),
            playerCount2Button.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 24),
            playerCount2Button.heightAnchor.constraint(equalToConstant: 66),

            playerCount4Button.topAnchor.constraint(equalTo: playerCount2Button.topAnchor),
            playerCount4Button.leadingAnchor.constraint(equalTo: playerCount2Button.trailingAnchor, constant: 12),
            playerCount4Button.trailingAnchor.constraint(equalTo: view.trailingAnchor, constant: -24),
            playerCount4Button.widthAnchor.constraint(equalTo: playerCount2Button.widthAnchor),
            playerCount4Button.heightAnchor.constraint(equalTo: playerCount2Button.heightAnchor),

            startButton.bottomAnchor.constraint(equalTo: safe.bottomAnchor, constant: -16),
            startButton.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 24),
            startButton.trailingAnchor.constraint(equalTo: view.trailingAnchor, constant: -24),
            startButton.heightAnchor.constraint(equalToConstant: 84),
        ])

        let gridContainer = UILayoutGuide()
        view.addLayoutGuide(gridContainer)
        NSLayoutConstraint.activate([
            gridContainer.topAnchor.constraint(equalTo: playerCount2Button.bottomAnchor, constant: 16),
            gridContainer.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 12),
            gridContainer.trailingAnchor.constraint(equalTo: view.trailingAnchor, constant: -12),
            gridContainer.bottomAnchor.constraint(equalTo: startButton.topAnchor, constant: -12),
        ])

        let card0 = cards[0], card1 = cards[1], card2 = cards[2], card3 = cards[3]
        // Cards are spaced apart and the centre logo is sized just under the
        // bite hole's safe inscribed circle (~biteRadius from the grid centre)
        // so it fills the visible hole with a few pt of breathing room.
        let cardGap: CGFloat = 16
        let logoDiameter: CGFloat = SetupPlayerCardView.defaultBiteRadius * 2 - 8

        NSLayoutConstraint.activate([
            // Top row.
            card0.topAnchor.constraint(equalTo: gridContainer.topAnchor),
            card0.leadingAnchor.constraint(equalTo: gridContainer.leadingAnchor),
            card1.topAnchor.constraint(equalTo: gridContainer.topAnchor),
            card1.trailingAnchor.constraint(equalTo: gridContainer.trailingAnchor),
            card1.leadingAnchor.constraint(equalTo: card0.trailingAnchor, constant: cardGap),
            card0.widthAnchor.constraint(equalTo: card1.widthAnchor),

            // Bottom row.
            card2.bottomAnchor.constraint(equalTo: gridContainer.bottomAnchor),
            card2.leadingAnchor.constraint(equalTo: gridContainer.leadingAnchor),
            card3.bottomAnchor.constraint(equalTo: gridContainer.bottomAnchor),
            card3.trailingAnchor.constraint(equalTo: gridContainer.trailingAnchor),
            card3.leadingAnchor.constraint(equalTo: card2.trailingAnchor, constant: cardGap),
            card2.widthAnchor.constraint(equalTo: card3.widthAnchor),

            card0.bottomAnchor.constraint(equalTo: card2.topAnchor, constant: -cardGap),
            card1.bottomAnchor.constraint(equalTo: card3.topAnchor, constant: -cardGap),
            card0.heightAnchor.constraint(equalTo: card2.heightAnchor),
            card1.heightAnchor.constraint(equalTo: card3.heightAnchor),
            card0.heightAnchor.constraint(equalTo: card1.heightAnchor),

            // Center logo, sized to fit inside the four converging bites.
            centerLogoView.centerXAnchor.constraint(equalTo: gridContainer.centerXAnchor),
            centerLogoView.centerYAnchor.constraint(equalTo: gridContainer.centerYAnchor),
            centerLogoView.widthAnchor.constraint(equalToConstant: logoDiameter),
            centerLogoView.heightAnchor.constraint(equalTo: centerLogoView.widthAnchor),
        ])
    }

    private func bind() {
        viewModel.onPlayersChanged = { [weak self] players in
            self?.refreshCards(with: players)
        }
        viewModel.onActivePlayerCountChanged = { [weak self] count in
            self?.applyPlayerCountSelection(count)
            self?.applyCardEnablement(count)
        }
        refreshCards(with: viewModel.setupPlayers)
        applyPlayerCountSelection(viewModel.activePlayerCount)
        applyCardEnablement(viewModel.activePlayerCount)
    }

    private func refreshCards(with players: [PlayerSetupModel]) {
        for (i, p) in players.enumerated() where i < cards.count {
            let card = cards[i]
            card.update(playerLabelText: "Player \(i + 1)", characterName: p.characterName)
            let accent = UnmatchedCharacters.setupAccentColor(for: p.characterName)
            card.apply(accent: accent)
        }
        applyCardEnablement(viewModel.activePlayerCount)
    }

    private func applyPlayerCountSelection(_ count: Int) {
        let select2 = (count == 2)
        playerCount2Button.layer.borderColor = (select2 ? Theme.Color.countButtonSelectedStroke : Theme.Color.cardBorder).cgColor
        playerCount2Button.layer.borderWidth = select2 ? 2 : 1
        playerCount4Button.layer.borderColor = (!select2 ? Theme.Color.countButtonSelectedStroke : Theme.Color.cardBorder).cgColor
        playerCount4Button.layer.borderWidth = !select2 ? 2 : 1
    }

    private func applyCardEnablement(_ count: Int) {
        for (i, card) in cards.enumerated() {
            let isOptional = i >= GameRules.minPlayerCount
            let disabled = isOptional && i >= count
            card.apply(disabled: disabled)
            if !disabled, let player = viewModel.findSetupPlayer(byId: i) {
                card.apply(accent: UnmatchedCharacters.setupAccentColor(for: player.characterName))
            }
        }
    }

    @objc private func set2Players() { viewModel.setActivePlayerCount(2) }
    @objc private func set4Players() { viewModel.setActivePlayerCount(GameRules.maxPlayerCount) }

    @objc private func startTapped() {
        let players = viewModel.playersForGame()
        let game = GameViewController(setupPlayers: players,
                                      repository: UserDefaultsGameRepository())
        game.modalPresentationStyle = .fullScreen
        navigationController?.pushViewController(game, animated: true)
    }

    private func openCharacterPicker(for playerIndex: Int) {
        let names = UnmatchedCharacters.sortedNames
        let current = viewModel.findSetupPlayer(byId: playerIndex)?.characterName
        let picker = CharacterPickerViewController(names: names, current: current) { [weak self] picked in
            self?.viewModel.setPlayerCharacter(playerId: playerIndex, characterName: picked)
        }
        let nav = UINavigationController(rootViewController: picker)
        nav.modalPresentationStyle = .formSheet
        present(nav, animated: true)
    }

    override var prefersStatusBarHidden: Bool { true }
}
