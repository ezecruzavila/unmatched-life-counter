import UIKit

/// Single life pool: a chip with the character / pool name at the top, a big
/// amount in the middle, and `+` / `−` HoldableButtons on the sides.
final class LifeCounterView: UIView {

    var onAmountIncremented: ((Int) -> Void)?

    private let labelView = PaddedLabel()
    private let amountLabel = UILabel()
    private let increment = HoldableButton()
    private let decrement = HoldableButton()

    /// Translucent black overlay drawn on top of the whole counter when the
    /// pool hits 0. `isUserInteractionEnabled = false` so touches still
    /// reach the `+` button underneath.
    private let deadOverlay = UIView()

    var amount: Int = 0 {
        didSet {
            amountLabel.text = "\(amount)"
            applyAliveState(amount > 0)
        }
    }

    /// Shadow the whole counter area (including the player background that
    /// shows through behind it) with a translucent black overlay drawn on
    /// top of everything, hide the number entirely, and block further
    /// subtractions when the pool hits 0. The overlay does not capture
    /// touches, so the `+` button underneath stays tappable.
    private func applyAliveState(_ isAlive: Bool) {
        deadOverlay.isHidden = isAlive
        amountLabel.alpha = isAlive ? 1.0 : 0.0
        decrement.isEnabled = isAlive
    }

    var label: String? {
        get { labelView.text }
        set {
            labelView.text = newValue
            labelView.isHidden = (newValue ?? "").trimmingCharacters(in: .whitespaces).isEmpty
        }
    }

    override init(frame: CGRect) {
        super.init(frame: frame)
        configure()
    }

    required init?(coder: NSCoder) { fatalError("init(coder:) is not supported") }

    private func configure() {
        labelView.insets = UIEdgeInsets(top: 5, left: 10, bottom: 5, right: 10)
        labelView.textColor = .white
        labelView.font = UIFont.systemFont(ofSize: 22, weight: .bold)
        labelView.textAlignment = .center
        labelView.numberOfLines = 1
        labelView.adjustsFontSizeToFitWidth = true
        labelView.minimumScaleFactor = 0.5
        labelView.backgroundColor = UIColor.black.withAlphaComponent(0.55)
        labelView.layer.cornerRadius = 12
        labelView.layer.masksToBounds = true
        labelView.setContentHuggingPriority(.required, for: .vertical)

        amountLabel.text = "0"
        amountLabel.textColor = .white
        amountLabel.textAlignment = .center
        amountLabel.font = UIFont.systemFont(ofSize: 110, weight: .heavy)
        amountLabel.adjustsFontSizeToFitWidth = true
        amountLabel.minimumScaleFactor = 0.2
        amountLabel.numberOfLines = 1
        amountLabel.layer.shadowColor = UIColor.black.cgColor
        amountLabel.layer.shadowRadius = 6
        amountLabel.layer.shadowOpacity = 0.85
        amountLabel.layer.shadowOffset = .zero

        increment.symbol = "+"
        decrement.symbol = "−"
        increment.onSingleClick = { [weak self] in self?.onAmountIncremented?(1) }
        decrement.onSingleClick = { [weak self] in self?.onAmountIncremented?(-1) }
        increment.onHoldContinued = { [weak self] iter in
            self?.onAmountIncremented?(CounterUtils.amountChange(forHoldIteration: iter))
        }
        decrement.onHoldContinued = { [weak self] iter in
            self?.onAmountIncremented?(-CounterUtils.amountChange(forHoldIteration: iter))
        }

        for v in [labelView, amountLabel, increment, decrement] {
            v.translatesAutoresizingMaskIntoConstraints = false
            addSubview(v)
        }

        // Overlay is added LAST so it draws above everything, including the
        // `+` button. It must not capture touches so the user can still
        // press `+` to bring the counter back from zero.
        deadOverlay.backgroundColor = UIColor.black.withAlphaComponent(0.6)
        deadOverlay.isUserInteractionEnabled = false
        deadOverlay.isHidden = true
        deadOverlay.translatesAutoresizingMaskIntoConstraints = false
        addSubview(deadOverlay)

        NSLayoutConstraint.activate([
            labelView.topAnchor.constraint(equalTo: topAnchor, constant: 8),
            labelView.centerXAnchor.constraint(equalTo: centerXAnchor),
            labelView.widthAnchor.constraint(lessThanOrEqualTo: widthAnchor, multiplier: 0.92),

            decrement.leadingAnchor.constraint(equalTo: leadingAnchor, constant: 4),
            decrement.centerYAnchor.constraint(equalTo: centerYAnchor),
            decrement.widthAnchor.constraint(equalTo: widthAnchor, multiplier: 0.18),
            decrement.heightAnchor.constraint(equalTo: decrement.widthAnchor),

            increment.trailingAnchor.constraint(equalTo: trailingAnchor, constant: -4),
            increment.centerYAnchor.constraint(equalTo: centerYAnchor),
            increment.widthAnchor.constraint(equalTo: widthAnchor, multiplier: 0.18),
            increment.heightAnchor.constraint(equalTo: increment.widthAnchor),

            amountLabel.leadingAnchor.constraint(equalTo: decrement.trailingAnchor, constant: 4),
            amountLabel.trailingAnchor.constraint(equalTo: increment.leadingAnchor, constant: -4),
            amountLabel.topAnchor.constraint(equalTo: labelView.bottomAnchor, constant: 4),
            amountLabel.bottomAnchor.constraint(equalTo: bottomAnchor, constant: -8),

            deadOverlay.topAnchor.constraint(equalTo: topAnchor),
            deadOverlay.bottomAnchor.constraint(equalTo: bottomAnchor),
            deadOverlay.leadingAnchor.constraint(equalTo: leadingAnchor),
            deadOverlay.trailingAnchor.constraint(equalTo: trailingAnchor),
        ])
    }
}

/// UILabel with text insets so it can render as a padded "chip".
private final class PaddedLabel: UILabel {
    var insets = UIEdgeInsets(top: 4, left: 8, bottom: 4, right: 8)

    override func drawText(in rect: CGRect) {
        super.drawText(in: rect.inset(by: insets))
    }

    override var intrinsicContentSize: CGSize {
        let s = super.intrinsicContentSize
        return CGSize(width: s.width + insets.left + insets.right,
                      height: s.height + insets.top + insets.bottom)
    }

    override func sizeThatFits(_ size: CGSize) -> CGSize {
        let inner = CGSize(width: size.width - insets.left - insets.right,
                           height: size.height - insets.top - insets.bottom)
        let s = super.sizeThatFits(inner)
        return CGSize(width: s.width + insets.left + insets.right,
                      height: s.height + insets.top + insets.bottom)
    }
}
