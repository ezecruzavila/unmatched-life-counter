import UIKit

/// The main game view controller. Lays out 2 or 4 player panels around the
/// table edge (rotated to face each seat), with a small hub of restart /
/// exit buttons in the centre.
final class GameViewController: UIViewController {

    private let viewModel: GameViewModel
    private let positions: [TableLayoutPosition]
    private var panels: [TableLayoutPosition: PlayerPanelView] = [:]
    private let hubContainer = UIStackView()

    init(setupPlayers: [PlayerSetupModel], repository: GameRepository) {
        self.viewModel = GameViewModel(setupPlayers: setupPlayers, repository: repository)
        self.positions = GameRules.tabletopPositions(forPlayerCount: setupPlayers.count)
        super.init(nibName: nil, bundle: nil)
    }

    required init?(coder: NSCoder) { fatalError("init(coder:) is not supported") }

    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = .black
        configurePanels()
        configureHub()
        bind()
    }

    override func viewDidLayoutSubviews() {
        super.viewDidLayoutSubviews()
        // Frame-based layout for the rotated panels: AutoLayout can't easily
        // describe "rotate 90° AND fill this rectangle" so we compute the
        // bounds + center ourselves once view.bounds is known.
        layoutPanels()
    }

    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        navigationController?.setNavigationBarHidden(true, animated: animated)
    }

    override var prefersStatusBarHidden: Bool { true }

    @available(iOS 11.0, *)
    override var prefersHomeIndicatorAutoHidden: Bool { viewModel.hideNavigation }

    private func configurePanels() {
        for position in positions {
            let panel = PlayerPanelView()
            panel.onLifeIncremented = { [weak self] playerId, diff, segmentIndex in
                self?.viewModel.incrementLife(playerId: playerId,
                                              lifeDifference: diff,
                                              segmentIndex: segmentIndex)
            }
            panels[position] = panel
            view.addSubview(panel)
        }
    }

    /// Black "matte" thickness around and between panels (matches the
    /// Android `player_divider_width` outer frame plus a clear inter-panel
    /// gap so each seat reads as a separate card).
    private static let panelMargin: CGFloat = 2

    /// Compute the visual rectangle (in `view.bounds` coordinates) for a
    /// given seat, leaving a black border around every panel and a black
    /// gap between adjacent panels. Frame-based (rather than Auto Layout)
    /// because the rotation transform applied below requires the bounds
    /// and centre to be set explicitly.
    private func visualRect(for position: TableLayoutPosition) -> CGRect {
        let m = GameViewController.panelMargin
        let outer = view.bounds.insetBy(dx: m, dy: m)
        let halfW = outer.width  / 2
        let halfH = outer.height / 2
        let gap = m  // gap between adjacent panels (each panel pulled back by `m / 2` per side)
        let halfGap = gap / 2
        switch position {
        case .topPanel:
            return CGRect(x: outer.minX,
                          y: outer.minY,
                          width: outer.width,
                          height: halfH - halfGap)
        case .bottomPanel:
            return CGRect(x: outer.minX,
                          y: outer.minY + halfH + halfGap,
                          width: outer.width,
                          height: halfH - halfGap)
        case .leftPanel1:
            return CGRect(x: outer.minX,
                          y: outer.minY,
                          width: halfW - halfGap,
                          height: halfH - halfGap)
        case .leftPanel2:
            return CGRect(x: outer.minX,
                          y: outer.minY + halfH + halfGap,
                          width: halfW - halfGap,
                          height: halfH - halfGap)
        case .rightPanel1:
            return CGRect(x: outer.minX + halfW + halfGap,
                          y: outer.minY,
                          width: halfW - halfGap,
                          height: halfH - halfGap)
        case .rightPanel2:
            return CGRect(x: outer.minX + halfW + halfGap,
                          y: outer.minY + halfH + halfGap,
                          width: halfW - halfGap,
                          height: halfH - halfGap)
        case .soloPanel:
            return outer
        case .leftPanel3, .rightPanel3:
            return .zero
        }
    }

    private func layoutPanels() {
        for (pos, panel) in panels {
            let rect = visualRect(for: pos)
            guard rect.width > 0, rect.height > 0 else {
                panel.isHidden = true; continue
            }
            panel.isHidden = false
            panel.transform = .identity
            let angle = rotation(for: pos)
            // For ±90° rotations, swap the bounds so the panel's content
            // (laid out left-to-right inside) ends up filling the on-screen
            // rectangle once rotated.
            let swap = (abs(angle.truncatingRemainder(dividingBy: .pi)) > 0.01)
            let unrotatedSize = swap
                ? CGSize(width: rect.height, height: rect.width)
                : rect.size
            panel.bounds = CGRect(origin: .zero, size: unrotatedSize)
            panel.center = CGPoint(x: rect.midX, y: rect.midY)
            panel.transform = CGAffineTransform(rotationAngle: angle)
        }
    }

    /// Rotation (in radians) so each panel "faces inwards": the top of the
    /// content (name + amount) sits on the side of the cell that's closest
    /// to the centre of the screen, so the player sitting on that edge of
    /// the table reads everything from the inside out.
    private func rotation(for position: TableLayoutPosition) -> CGFloat {
        switch position {
        case .soloPanel:
            return CGFloat.pi * 1.5
        case .topPanel:
            return CGFloat.pi
        case .bottomPanel:
            return 0
        case .leftPanel1, .leftPanel2, .leftPanel3:
            return CGFloat.pi * 0.5
        case .rightPanel1, .rightPanel2, .rightPanel3:
            return CGFloat.pi * 1.5
        }
    }

    private func configureHub() {
        hubContainer.axis = .horizontal
        hubContainer.spacing = 12
        hubContainer.alignment = .center
        hubContainer.distribution = .fill

        let restart = makeHubButton(symbol: "↻") { [weak self] in self?.openResetPrompt() }
        let exit = makeHubButton(symbol: "×") { [weak self] in self?.openExitPrompt() }
        hubContainer.addArrangedSubview(restart)
        hubContainer.addArrangedSubview(exit)

        let longPress = UILongPressGestureRecognizer(target: self,
                                                     action: #selector(hubLongPressed(_:)))
        hubContainer.addGestureRecognizer(longPress)

        view.addSubview(hubContainer)
        hubContainer.translatesAutoresizingMaskIntoConstraints = false
        NSLayoutConstraint.activate([
            hubContainer.centerXAnchor.constraint(equalTo: view.centerXAnchor),
            hubContainer.centerYAnchor.constraint(equalTo: view.centerYAnchor),
        ])
    }

    private func makeHubButton(symbol: String, action: @escaping () -> Void) -> UIView {
        let container = ClosureButton(action: action)
        container.backgroundColor = Theme.Color.hubFill
        container.layer.cornerRadius = 24
        container.layer.borderColor = Theme.Color.hubBorder.cgColor
        container.layer.borderWidth = 2
        container.translatesAutoresizingMaskIntoConstraints = false

        let label = UILabel()
        label.text = symbol
        label.textColor = .white
        label.font = UIFont.systemFont(ofSize: 22, weight: .bold)
        label.textAlignment = .center
        label.translatesAutoresizingMaskIntoConstraints = false
        container.addSubview(label)
        NSLayoutConstraint.activate([
            container.widthAnchor.constraint(equalToConstant: 48),
            container.heightAnchor.constraint(equalToConstant: 48),
            label.centerXAnchor.constraint(equalTo: container.centerXAnchor),
            label.centerYAnchor.constraint(equalTo: container.centerYAnchor),
        ])
        return container
    }

    @objc private func hubLongPressed(_ gr: UILongPressGestureRecognizer) {
        guard gr.state == .began else { return }
        openDisplaySettings()
    }

    private func openExitPrompt() {
        let alert = UIAlertController(title: "Exit Game",
                                      message: "Are you sure you want to exit the game?",
                                      preferredStyle: .alert)
        alert.addAction(UIAlertAction(title: "Yes", style: .destructive) { [weak self] _ in
            self?.navigationController?.popViewController(animated: true)
        })
        alert.addAction(UIAlertAction(title: "No", style: .cancel))
        present(alert, animated: true)
    }

    private func openResetPrompt() {
        let alert = UIAlertController(title: "Reset Game",
                                      message: "Are you sure you want to reset the game?",
                                      preferredStyle: .alert)
        alert.addAction(UIAlertAction(title: "Yes", style: .destructive) { [weak self] _ in
            self?.viewModel.resetGame()
        })
        alert.addAction(UIAlertAction(title: "No", style: .cancel))
        present(alert, animated: true)
    }

    private func openDisplaySettings() {
        let alert = UIAlertController(title: "Display Settings", message: nil, preferredStyle: .actionSheet)
        let title = viewModel.hideNavigation ? "Show Navigation" : "Hide Navigation"
        alert.addAction(UIAlertAction(title: title, style: .default) { [weak self] _ in
            guard let self = self else { return }
            self.viewModel.hideNavigation.toggle()
            if #available(iOS 11.0, *) {
                self.setNeedsUpdateOfHomeIndicatorAutoHidden()
            }
        })
        alert.addAction(UIAlertAction(title: "Cancel", style: .cancel))
        if let pop = alert.popoverPresentationController {
            pop.sourceView = hubContainer
            pop.sourceRect = hubContainer.bounds
        }
        present(alert, animated: true)
    }

    private func bind() {
        viewModel.onPlayersChanged = { [weak self] players in
            self?.refresh(with: players)
        }
        refresh(with: viewModel.players)
    }

    private func refresh(with players: [PlayerModel]) {
        for (i, player) in players.enumerated() where i < positions.count {
            panels[positions[i]]?.bind(player)
        }
    }
}

/// UIControl subclass that runs a closure on touch-up-inside, so the hub
/// buttons don't need a separate target class.
private final class ClosureButton: UIControl {
    private let action: () -> Void

    init(action: @escaping () -> Void) {
        self.action = action
        super.init(frame: .zero)
        addTarget(self, action: #selector(triggered), for: .touchUpInside)
    }

    required init?(coder: NSCoder) { fatalError("init(coder:) is not supported") }

    @objc private func triggered() { action() }
}
