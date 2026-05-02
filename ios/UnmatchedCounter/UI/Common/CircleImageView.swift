import UIKit

/// UIImageView whose content is clipped to a perfect circle that always
/// matches the smallest dimension of the view's bounds.
final class CircleImageView: UIImageView {
    override func layoutSubviews() {
        super.layoutSubviews()
        layer.cornerRadius = min(bounds.width, bounds.height) / 2.0
        layer.masksToBounds = true
    }
}
