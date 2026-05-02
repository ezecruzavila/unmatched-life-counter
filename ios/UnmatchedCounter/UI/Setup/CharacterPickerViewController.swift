import UIKit

/// Modal table-view picker that replaces the Android character spinner.
final class CharacterPickerViewController: UIViewController, UITableViewDataSource, UITableViewDelegate {

    private let names: [String]
    private let initialSelection: String?
    private let onSelect: (String) -> Void

    private let tableView = UITableView(frame: .zero, style: .plain)

    init(names: [String], current: String?, onSelect: @escaping (String) -> Void) {
        self.names = names
        self.initialSelection = current
        self.onSelect = onSelect
        super.init(nibName: nil, bundle: nil)
        modalPresentationStyle = .formSheet
    }

    required init?(coder: NSCoder) { fatalError("init(coder:) is not supported") }

    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = Theme.Color.cardFill
        title = "Select Character"

        navigationItem.rightBarButtonItem = UIBarButtonItem(
            barButtonSystemItem: .cancel, target: self, action: #selector(cancelTapped))

        tableView.dataSource = self
        tableView.delegate = self
        tableView.backgroundColor = Theme.Color.cardFill
        tableView.separatorColor = Theme.Color.cardBorder
        tableView.register(UITableViewCell.self, forCellReuseIdentifier: "cell")
        view.addSubview(tableView)
        tableView.pinEdges()

        if let current = initialSelection,
           let row = names.firstIndex(of: current) {
            DispatchQueue.main.async { [weak self] in
                self?.tableView.scrollToRow(at: IndexPath(row: row, section: 0),
                                            at: .middle, animated: false)
            }
        }
    }

    @objc private func cancelTapped() { dismiss(animated: true) }

    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return names.count
    }

    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        let cell = tableView.dequeueReusableCell(withIdentifier: "cell", for: indexPath)
        let name = names[indexPath.row]
        cell.textLabel?.text = name
        cell.textLabel?.textColor = Theme.Color.textPrimary
        cell.backgroundColor = Theme.Color.cardFill
        cell.imageView?.image = nil
        cell.accessoryType = (name == initialSelection) ? .checkmark : .none
        cell.selectionStyle = .default
        return cell
    }

    func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        tableView.deselectRow(at: indexPath, animated: true)
        let name = names[indexPath.row]
        onSelect(name)
        dismiss(animated: true)
    }
}
