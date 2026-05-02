import UIKit

final class SplashViewController: UIViewController {

    private let logoView = UIImageView(image: UIImage(named: "splash_unmatched_logo"))

    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = Theme.Color.background
        logoView.contentMode = .scaleAspectFit
        view.addSubview(logoView)
        logoView.translatesAutoresizingMaskIntoConstraints = false
        NSLayoutConstraint.activate([
            logoView.centerXAnchor.constraint(equalTo: view.centerXAnchor),
            logoView.centerYAnchor.constraint(equalTo: view.centerYAnchor),
            logoView.widthAnchor.constraint(equalTo: view.widthAnchor, multiplier: 0.7),
            logoView.heightAnchor.constraint(equalTo: logoView.widthAnchor, multiplier: 537.0 / 1024.0),
        ])
    }

    override func viewDidAppear(_ animated: Bool) {
        super.viewDidAppear(animated)
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.7) { [weak self] in
            self?.transitionToSetup()
        }
    }

    private func transitionToSetup() {
        let setup = SetupViewController()
        let nav = UINavigationController(rootViewController: setup)
        nav.setNavigationBarHidden(true, animated: false)
        nav.modalPresentationStyle = .fullScreen
        if let window = view.window {
            UIView.transition(with: window, duration: 0.35, options: .transitionCrossDissolve,
                              animations: { window.rootViewController = nav },
                              completion: nil)
        }
    }

    override var prefersStatusBarHidden: Bool { true }
}
