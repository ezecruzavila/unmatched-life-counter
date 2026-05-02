import UIKit

/// Centralised colour and asset names so view code never references the
/// raw asset catalog string in more than one place.
enum Theme {

    enum Color {
        static let background        = UIColor(named: "off_black") ?? .black
        static let textPrimary       = UIColor(named: "white") ?? .white
        static let textSecondary     = UIColor(named: "dark_grey") ?? .lightGray
        static let cardFill          = UIColor(named: "setup_player_card_bg") ?? .darkGray
        static let cardBorder        = UIColor(named: "setup_ui_border_gray") ?? .gray
        static let cardBorderDisabled = UIColor(named: "setup_ui_border_disabled") ?? .darkGray
        static let spinnerFill       = UIColor(named: "setup_spinner_field_fill") ?? .black
        static let countButtonUnselectedFill = UIColor(named: "setup_player_count_button_unselected_fill") ?? .black
        static let countButtonSelectedStroke = UIColor(named: "setup_player_count_button_selected_stroke") ?? .systemTeal
        static let dividerLeft       = UIColor(named: "setup_divider_left") ?? .systemTeal
        static let dividerRight      = UIColor(named: "setup_divider_right") ?? .systemOrange
        static let hubFill           = UIColor(named: "game_hub_hex_fill") ?? .black
        static let hubBorder         = UIColor(named: "game_hub_hex_border") ?? .white
    }

    enum Font {
        static func bold(_ size: CGFloat) -> UIFont { UIFont.boldSystemFont(ofSize: size) }
        static func medium(_ size: CGFloat) -> UIFont {
            return UIFont.systemFont(ofSize: size, weight: .medium)
        }
        static func regular(_ size: CGFloat) -> UIFont { UIFont.systemFont(ofSize: size) }
    }
}

extension UIView {
    /// Pin to the four edges of `other` (defaults to the receiver's superview).
    func pinEdges(to other: UIView? = nil, insets: UIEdgeInsets = .zero) {
        guard let target = other ?? superview else { return }
        translatesAutoresizingMaskIntoConstraints = false
        NSLayoutConstraint.activate([
            topAnchor.constraint(equalTo: target.topAnchor, constant: insets.top),
            leadingAnchor.constraint(equalTo: target.leadingAnchor, constant: insets.left),
            trailingAnchor.constraint(equalTo: target.trailingAnchor, constant: -insets.right),
            bottomAnchor.constraint(equalTo: target.bottomAnchor, constant: -insets.bottom),
        ])
    }
}
