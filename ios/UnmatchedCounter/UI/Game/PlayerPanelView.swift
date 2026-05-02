import UIKit

/// One seat at the tabletop. Shows the character art as background and a row
/// of LifeCounterViews (one per life pool, 1-3 of them).
final class PlayerPanelView: UIView {

    var onLifeIncremented: ((_ playerId: Int, _ amountDifference: Int, _ segmentIndex: Int) -> Void)?

    private let backgroundImageView = UIImageView()
    private let counterStack = UIStackView()
    private let separators: [UIView] = [UIView(), UIView()]
    private let lifeCounters: [LifeCounterView] = [LifeCounterView(), LifeCounterView(), LifeCounterView()]
    private var lifeCounterWidthConstraints: [NSLayoutConstraint] = []
    private var playerId: Int = -1

    override init(frame: CGRect) {
        super.init(frame: frame)
        configure()
    }

    required init?(coder: NSCoder) { fatalError("init(coder:) is not supported") }

    private func configure() {
        backgroundColor = .black
        clipsToBounds = true

        backgroundImageView.contentMode = .scaleAspectFill
        backgroundImageView.alpha = 0.6
        backgroundImageView.translatesAutoresizingMaskIntoConstraints = false
        addSubview(backgroundImageView)
        backgroundImageView.pinEdges(to: self)

        counterStack.axis = .horizontal
        counterStack.alignment = .fill
        counterStack.distribution = .fill
        counterStack.spacing = 0

        for sep in separators {
            // Matches Android `counter_divider_width=3dp` over `player_divider`
            // (solid black). Required so the rendered width is always 3pt,
            // even when the counter weight constraints would otherwise eat
            // 100% of the panel width.
            sep.backgroundColor = .black
            sep.translatesAutoresizingMaskIntoConstraints = false
            sep.widthAnchor.constraint(equalToConstant: 3).isActive = true
        }

        let elements: [UIView] = [
            lifeCounters[0],
            separators[0],
            lifeCounters[1],
            separators[1],
            lifeCounters[2],
        ]
        for v in elements {
            counterStack.addArrangedSubview(v)
        }

        counterStack.translatesAutoresizingMaskIntoConstraints = false
        addSubview(counterStack)
        NSLayoutConstraint.activate([
            counterStack.leadingAnchor.constraint(equalTo: leadingAnchor),
            counterStack.trailingAnchor.constraint(equalTo: trailingAnchor),
            counterStack.topAnchor.constraint(equalTo: topAnchor),
            counterStack.bottomAnchor.constraint(equalTo: bottomAnchor),
        ])

        for (i, counter) in lifeCounters.enumerated() {
            counter.onAmountIncremented = { [weak self] diff in
                guard let self = self else { return }
                self.onLifeIncremented?(self.playerId, diff, i)
            }
        }
    }

    func bind(_ player: PlayerModel) {
        playerId = player.id
        backgroundImageView.image = UnmatchedCharacters.backgroundImage(
            for: player.characterName, playerIdForFallback: player.id)

        let count = player.lifeSegments.count
        for i in 0..<lifeCounters.count {
            let visible = i < count
            lifeCounters[i].isHidden = !visible
            if visible {
                lifeCounters[i].label = player.lifeSegmentLabels[i]
                lifeCounters[i].amount = player.lifeSegments[i]
            }
        }
        separators[0].isHidden = count < 2
        separators[1].isHidden = count < 3

        applyLifeColumnWeights(visibleCount: count)
    }

    private func applyLifeColumnWeights(visibleCount: Int) {
        // Match the Android weighting (15:9 for two-pool fighters so the main
        // pool reads bigger than the sidekick pool).
        let weights: [CGFloat]
        switch visibleCount {
        case 1: weights = [1, 0, 0]
        case 2: weights = [15, 9, 0]
        case 3: weights = [1, 1, 1]
        default: weights = [0, 0, 0]
        }
        let total = weights.reduce(0, +)

        NSLayoutConstraint.deactivate(lifeCounterWidthConstraints)
        lifeCounterWidthConstraints.removeAll()

        for (i, counter) in lifeCounters.enumerated() {
            guard total > 0, weights[i] > 0 else { continue }
            let c = counter.widthAnchor.constraint(equalTo: widthAnchor,
                                                   multiplier: weights[i] / total)
            // Counter widths are RATIOS, the divider is a hard 3pt: lower
            // the counter constraint priority so the divider always renders
            // (the counters absorb the small width loss proportionally).
            c.priority = .defaultHigh
            c.isActive = true
            lifeCounterWidthConstraints.append(c)
        }
    }
}
