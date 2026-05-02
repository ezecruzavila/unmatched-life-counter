import UIKit

/// Button that fires `onSingleClick` on a tap and `onHoldContinued` on a
/// long press, accelerating the interval as the press is held — same idea
/// as the Android `HoldableButton`.
final class HoldableButton: UIControl {

    var onSingleClick: (() -> Void)?
    var onHoldContinued: ((Int) -> Void)?

    private let label = UILabel()
    private var holdTimer: Timer?
    private var holdIncrements: Int = 0
    private var touchStart: CGPoint = .zero
    private var holdStartTime: CFTimeInterval = 0

    private static let maxClickDistance: CGFloat = 16
    private static let maxHoldInterval: TimeInterval = 0.6
    private static let minHoldInterval: TimeInterval = 0.01

    /// (incrementsThreshold, intervalSeconds), interpolated as the press is held.
    private let intervalRamp: [(Int, TimeInterval)] = [
        (0,   0.6),
        (6,   0.4),
        (15,  0.2),
        (30,  0.15),
        (100, 0.03),
        (500, 0.01),
    ]

    var symbol: String = "+" {
        didSet { label.text = symbol }
    }

    override init(frame: CGRect) {
        super.init(frame: frame)
        configure()
    }

    required init?(coder: NSCoder) { fatalError("init(coder:) is not supported") }

    private func configure() {
        backgroundColor = UIColor.white.withAlphaComponent(0.08)
        layer.cornerRadius = 8
        clipsToBounds = true
        label.text = symbol
        label.textColor = .white
        label.textAlignment = .center
        label.font = UIFont.boldSystemFont(ofSize: 28)
        label.translatesAutoresizingMaskIntoConstraints = false
        addSubview(label)
        NSLayoutConstraint.activate([
            label.centerXAnchor.constraint(equalTo: centerXAnchor),
            label.centerYAnchor.constraint(equalTo: centerYAnchor),
        ])
    }

    override func beginTracking(_ touch: UITouch, with event: UIEvent?) -> Bool {
        touchStart = touch.location(in: self)
        holdStartTime = CACurrentMediaTime()
        holdIncrements = 0
        backgroundColor = UIColor.white.withAlphaComponent(0.18)
        scheduleNext(after: HoldableButton.maxHoldInterval)
        return true
    }

    override func continueTracking(_ touch: UITouch, with event: UIEvent?) -> Bool {
        let p = touch.location(in: self)
        let dx = p.x - touchStart.x, dy = p.y - touchStart.y
        if hypot(dx, dy) > HoldableButton.maxClickDistance {
            cancelHold()
            return false
        }
        return true
    }

    override func endTracking(_ touch: UITouch?, with event: UIEvent?) {
        backgroundColor = UIColor.white.withAlphaComponent(0.08)
        let isClick = (CACurrentMediaTime() - holdStartTime) < HoldableButton.maxHoldInterval
        cancelHold()
        if isClick {
            onSingleClick?()
        }
    }

    override func cancelTracking(with event: UIEvent?) {
        backgroundColor = UIColor.white.withAlphaComponent(0.08)
        cancelHold()
    }

    private func cancelHold() {
        holdTimer?.invalidate()
        holdTimer = nil
    }

    private func scheduleNext(after interval: TimeInterval) {
        cancelHold()
        holdTimer = Timer.scheduledTimer(withTimeInterval: interval, repeats: false) { [weak self] _ in
            guard let self = self else { return }
            self.holdIncrements += 1
            self.onHoldContinued?(self.holdIncrements)
            self.scheduleNext(after: self.intervalForCurrentIncrements())
        }
    }

    private func intervalForCurrentIncrements() -> TimeInterval {
        let inc = holdIncrements
        let ramp = intervalRamp
        for i in 0..<ramp.count {
            if i == ramp.count - 1 { return ramp[i].1 }
            let (curT, curI) = ramp[i]
            let (nextT, nextI) = ramp[i + 1]
            if inc >= curT && inc < nextT {
                let totalT = TimeInterval(nextT - curT)
                let progress = TimeInterval(inc - curT) / totalT
                return curI + (nextI - curI) * progress
            }
        }
        return HoldableButton.maxHoldInterval
    }
}
