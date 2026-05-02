import UIKit

/// Which corner of the card faces the central Unmatched logo / hub. Used to
/// punch a circular "bite" in that corner so the hub peeks through, matching
/// the Android `SetupPlayerCardBackgroundDrawable`.
enum SetupHubFacingCorner {
    case bottomRight
    case bottomLeft
    case topRight
    case topLeft

    var isOnTop: Bool { self == .topLeft || self == .topRight }
    var isOnBottom: Bool { self == .bottomLeft || self == .bottomRight }
}

/// One of the four player cards on the Setup screen: a circular avatar,
/// the "Player N" label, and a tappable "spinner row" that opens the
/// character picker. Drawn as a rounded rectangle minus a circular notch in
/// the corner that faces the central hub.
final class SetupPlayerCardView: UIView {

    let avatarImageView = CircleImageView()
    let playerLabel = UILabel()
    let characterButton = UIButton(type: .system)

    /// User tapped the character row; show the picker.
    var onPickCharacter: (() -> Void)?

    /// Diameter of the hub circle that `biteRadius` carves out of the card.
    /// Should roughly match the centre logo's diameter so the four bites
    /// frame the logo cleanly.
    static let defaultBiteRadius: CGFloat = 62
    private static let cornerRadius: CGFloat = 16
    private static let strokeWidth: CGFloat = 2

    private let hubFacingCorner: SetupHubFacingCorner
    private let biteRadius: CGFloat

    private let cardBorderLayer = CAShapeLayer()
    private let spinnerRow = UIView()

    init(hubFacingCorner: SetupHubFacingCorner,
         biteRadius: CGFloat = SetupPlayerCardView.defaultBiteRadius) {
        self.hubFacingCorner = hubFacingCorner
        self.biteRadius = biteRadius
        super.init(frame: .zero)
        configure()
    }

    required init?(coder: NSCoder) { fatalError("init(coder:) is not supported") }

    private func configure() {
        backgroundColor = .clear

        layer.addSublayer(cardBorderLayer)
        cardBorderLayer.fillColor = Theme.Color.cardFill.cgColor
        cardBorderLayer.strokeColor = Theme.Color.cardBorder.cgColor
        cardBorderLayer.lineWidth = SetupPlayerCardView.strokeWidth
        cardBorderLayer.lineJoin = .round
        cardBorderLayer.fillRule = .nonZero

        avatarImageView.contentMode = .scaleAspectFit
        avatarImageView.layer.borderWidth = 2
        avatarImageView.layer.borderColor = Theme.Color.cardBorder.cgColor
        addSubview(avatarImageView)

        playerLabel.textColor = Theme.Color.textPrimary
        playerLabel.font = Theme.Font.bold(19)
        playerLabel.textAlignment = .center
        addSubview(playerLabel)

        spinnerRow.backgroundColor = Theme.Color.spinnerFill
        spinnerRow.layer.cornerRadius = 8
        spinnerRow.layer.borderWidth = 1
        spinnerRow.layer.borderColor = Theme.Color.cardBorder.cgColor
        addSubview(spinnerRow)

        characterButton.setTitleColor(Theme.Color.textPrimary, for: .normal)
        characterButton.titleLabel?.font = Theme.Font.medium(18)
        characterButton.titleLabel?.adjustsFontSizeToFitWidth = true
        characterButton.titleLabel?.minimumScaleFactor = 0.6
        characterButton.contentHorizontalAlignment = .center
        characterButton.titleEdgeInsets = UIEdgeInsets(top: 0, left: 12, bottom: 0, right: 12)
        characterButton.addTarget(self, action: #selector(characterTapped), for: .touchUpInside)
        spinnerRow.addSubview(characterButton)

        let chevron = UILabel()
        chevron.text = "▾"
        chevron.textColor = Theme.Color.textPrimary
        chevron.font = Theme.Font.bold(17)
        chevron.textAlignment = .center
        chevron.translatesAutoresizingMaskIntoConstraints = false
        spinnerRow.addSubview(chevron)

        avatarImageView.translatesAutoresizingMaskIntoConstraints = false
        playerLabel.translatesAutoresizingMaskIntoConstraints = false
        spinnerRow.translatesAutoresizingMaskIntoConstraints = false
        characterButton.translatesAutoresizingMaskIntoConstraints = false

        // Reserve space for the corner bite so content isn't drawn into it.
        let bitePad: CGFloat = biteRadius - 8
        let topPad: CGFloat = hubFacingCorner.isOnTop ? bitePad : 12
        let bottomPad: CGFloat = hubFacingCorner.isOnBottom ? bitePad : 12

        // Equal-height spacers above and below the content stack center it
        // vertically inside the bite-aware safe area, regardless of which
        // corner the bite is in.
        let topSpacer = UILayoutGuide()
        let bottomSpacer = UILayoutGuide()
        addLayoutGuide(topSpacer)
        addLayoutGuide(bottomSpacer)

        NSLayoutConstraint.activate([
            topSpacer.topAnchor.constraint(equalTo: topAnchor, constant: topPad),
            topSpacer.bottomAnchor.constraint(equalTo: avatarImageView.topAnchor),
            bottomSpacer.topAnchor.constraint(equalTo: spinnerRow.bottomAnchor),
            bottomSpacer.bottomAnchor.constraint(equalTo: bottomAnchor, constant: -bottomPad),
            topSpacer.heightAnchor.constraint(equalTo: bottomSpacer.heightAnchor),

            avatarImageView.centerXAnchor.constraint(equalTo: centerXAnchor),
            avatarImageView.widthAnchor.constraint(lessThanOrEqualTo: widthAnchor, multiplier: 0.3),
            avatarImageView.widthAnchor.constraint(equalTo: avatarImageView.heightAnchor),

            playerLabel.topAnchor.constraint(equalTo: avatarImageView.bottomAnchor, constant: 8),
            playerLabel.leadingAnchor.constraint(equalTo: leadingAnchor, constant: 8),
            playerLabel.trailingAnchor.constraint(equalTo: trailingAnchor, constant: -8),

            spinnerRow.topAnchor.constraint(equalTo: playerLabel.bottomAnchor, constant: 8),
            spinnerRow.centerXAnchor.constraint(equalTo: centerXAnchor),
            spinnerRow.widthAnchor.constraint(equalTo: widthAnchor, multiplier: 0.7),
            spinnerRow.heightAnchor.constraint(equalToConstant: 65),

            characterButton.leadingAnchor.constraint(equalTo: spinnerRow.leadingAnchor),
            characterButton.topAnchor.constraint(equalTo: spinnerRow.topAnchor),
            characterButton.bottomAnchor.constraint(equalTo: spinnerRow.bottomAnchor),
            characterButton.trailingAnchor.constraint(equalTo: chevron.leadingAnchor),

            chevron.trailingAnchor.constraint(equalTo: spinnerRow.trailingAnchor, constant: -10),
            chevron.centerYAnchor.constraint(equalTo: spinnerRow.centerYAnchor),
            chevron.widthAnchor.constraint(equalToConstant: 18),
        ])

        let avatarHeightTarget = avatarImageView.heightAnchor.constraint(equalTo: heightAnchor, multiplier: 0.19)
        avatarHeightTarget.priority = .defaultHigh
        avatarHeightTarget.isActive = true
    }

    override func layoutSubviews() {
        super.layoutSubviews()
        cardBorderLayer.frame = bounds
        // Inset by half the stroke so the visible border isn't clipped by
        // the layer / superview bounds.
        let half = SetupPlayerCardView.strokeWidth / 2
        let pathRect = bounds.insetBy(dx: half, dy: half)
        cardBorderLayer.path = SetupPlayerCardView.cardOutlinePath(
            in: pathRect,
            cornerRadius: SetupPlayerCardView.cornerRadius,
            biteRadius: biteRadius,
            hubFacingCorner: hubFacingCorner
        ).cgPath
    }

    /// Apply the per-character accent colour (used for borders and avatar ring).
    func apply(accent color: UIColor) {
        cardBorderLayer.strokeColor = color.cgColor
        avatarImageView.layer.borderColor = color.cgColor
        spinnerRow.layer.borderColor = color.cgColor
    }

    /// Visually mute / un-mute the card when it is disabled (e.g. seat 3/4 in
    /// a 2-player game).
    func apply(disabled: Bool) {
        alpha = disabled ? 0.4 : 1.0
        isUserInteractionEnabled = !disabled
        if disabled {
            cardBorderLayer.strokeColor = Theme.Color.cardBorderDisabled.cgColor
            spinnerRow.layer.borderColor = Theme.Color.cardBorderDisabled.cgColor
            avatarImageView.layer.borderColor = Theme.Color.cardBorderDisabled.cgColor
        }
    }

    func update(playerLabelText: String, characterName: String) {
        playerLabel.text = playerLabelText
        characterButton.setTitle(characterName, for: .normal)
        avatarImageView.image = UnmatchedCharacters.avatarImage(for: characterName)
    }

    @objc private func characterTapped() { onPickCharacter?() }

    /// Walks a single closed CW path: rounded rectangle, but the corner that
    /// faces the hub is replaced by a CCW arc of `biteRadius` centred on the
    /// rectangle's actual corner, carving a circular notch out of the card.
    private static func cardOutlinePath(in rect: CGRect,
                                        cornerRadius cr: CGFloat,
                                        biteRadius br: CGFloat,
                                        hubFacingCorner hub: SetupHubFacingCorner) -> UIBezierPath {
        let p = UIBezierPath()
        let minX = rect.minX, maxX = rect.maxX, minY = rect.minY, maxY = rect.maxY
        let halfPi = CGFloat.pi / 2

        // When the bite is at top-left the bite arc terminates on the top
        // edge at (minX + br, minY). Starting the path further left would
        // make `closeSubpath` draw a phantom segment across the bite.
        let startX: CGFloat = (hub == .topLeft) ? (minX + br) : (minX + cr)
        p.move(to: CGPoint(x: startX, y: minY))

        // Top edge → top-right corner.
        if hub == .topRight {
            p.addLine(to: CGPoint(x: maxX - br, y: minY))
            p.addArc(withCenter: CGPoint(x: maxX, y: minY), radius: br,
                     startAngle: .pi, endAngle: halfPi, clockwise: false)
        } else {
            p.addLine(to: CGPoint(x: maxX - cr, y: minY))
            p.addArc(withCenter: CGPoint(x: maxX - cr, y: minY + cr), radius: cr,
                     startAngle: -halfPi, endAngle: 0, clockwise: true)
        }

        // Right edge → bottom-right corner.
        if hub == .bottomRight {
            p.addLine(to: CGPoint(x: maxX, y: maxY - br))
            p.addArc(withCenter: CGPoint(x: maxX, y: maxY), radius: br,
                     startAngle: -halfPi, endAngle: .pi, clockwise: false)
        } else {
            p.addLine(to: CGPoint(x: maxX, y: maxY - cr))
            p.addArc(withCenter: CGPoint(x: maxX - cr, y: maxY - cr), radius: cr,
                     startAngle: 0, endAngle: halfPi, clockwise: true)
        }

        // Bottom edge → bottom-left corner.
        if hub == .bottomLeft {
            p.addLine(to: CGPoint(x: minX + br, y: maxY))
            p.addArc(withCenter: CGPoint(x: minX, y: maxY), radius: br,
                     startAngle: 0, endAngle: -halfPi, clockwise: false)
        } else {
            p.addLine(to: CGPoint(x: minX + cr, y: maxY))
            p.addArc(withCenter: CGPoint(x: minX + cr, y: maxY - cr), radius: cr,
                     startAngle: halfPi, endAngle: .pi, clockwise: true)
        }

        // Left edge → top-left corner.
        if hub == .topLeft {
            p.addLine(to: CGPoint(x: minX, y: minY + br))
            p.addArc(withCenter: CGPoint(x: minX, y: minY), radius: br,
                     startAngle: halfPi, endAngle: 0, clockwise: false)
        } else {
            p.addLine(to: CGPoint(x: minX, y: minY + cr))
            p.addArc(withCenter: CGPoint(x: minX + cr, y: minY + cr), radius: cr,
                     startAngle: .pi, endAngle: -halfPi, clockwise: true)
        }

        p.close()
        return p
    }
}
