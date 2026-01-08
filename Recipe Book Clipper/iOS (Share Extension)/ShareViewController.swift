import UIKit
import Social
import UniformTypeIdentifiers

class ShareViewController: UIViewController {

    private let apiURL = "https://recipebook-production-2f06.up.railway.app/api/extract"

    private let containerView: UIView = {
        let view = UIView()
        view.backgroundColor = UIColor.systemBackground
        view.layer.cornerRadius = 16
        view.translatesAutoresizingMaskIntoConstraints = false
        return view
    }()

    private let titleLabel: UILabel = {
        let label = UILabel()
        label.text = "Recipe Book"
        label.font = UIFont.boldSystemFont(ofSize: 20)
        label.textAlignment = .center
        label.translatesAutoresizingMaskIntoConstraints = false
        return label
    }()

    private let statusLabel: UILabel = {
        let label = UILabel()
        label.text = "Saving recipe..."
        label.font = UIFont.systemFont(ofSize: 16)
        label.textColor = .secondaryLabel
        label.textAlignment = .center
        label.numberOfLines = 0
        label.translatesAutoresizingMaskIntoConstraints = false
        return label
    }()

    private let activityIndicator: UIActivityIndicatorView = {
        let indicator = UIActivityIndicatorView(style: .large)
        indicator.translatesAutoresizingMaskIntoConstraints = false
        return indicator
    }()

    private let checkmarkImageView: UIImageView = {
        let config = UIImage.SymbolConfiguration(pointSize: 50, weight: .medium)
        let image = UIImage(systemName: "checkmark.circle.fill", withConfiguration: config)
        let imageView = UIImageView(image: image)
        imageView.tintColor = .systemGreen
        imageView.translatesAutoresizingMaskIntoConstraints = false
        imageView.isHidden = true
        return imageView
    }()

    private let errorImageView: UIImageView = {
        let config = UIImage.SymbolConfiguration(pointSize: 50, weight: .medium)
        let image = UIImage(systemName: "xmark.circle.fill", withConfiguration: config)
        let imageView = UIImageView(image: image)
        imageView.tintColor = .systemRed
        imageView.translatesAutoresizingMaskIntoConstraints = false
        imageView.isHidden = true
        return imageView
    }()

    override func viewDidLoad() {
        super.viewDidLoad()
        setupUI()
        extractAndSaveRecipe()
    }

    private func setupUI() {
        view.backgroundColor = UIColor.black.withAlphaComponent(0.4)

        view.addSubview(containerView)
        containerView.addSubview(titleLabel)
        containerView.addSubview(statusLabel)
        containerView.addSubview(activityIndicator)
        containerView.addSubview(checkmarkImageView)
        containerView.addSubview(errorImageView)

        NSLayoutConstraint.activate([
            containerView.centerXAnchor.constraint(equalTo: view.centerXAnchor),
            containerView.centerYAnchor.constraint(equalTo: view.centerYAnchor),
            containerView.widthAnchor.constraint(equalToConstant: 280),
            containerView.heightAnchor.constraint(equalToConstant: 180),

            titleLabel.topAnchor.constraint(equalTo: containerView.topAnchor, constant: 20),
            titleLabel.leadingAnchor.constraint(equalTo: containerView.leadingAnchor, constant: 16),
            titleLabel.trailingAnchor.constraint(equalTo: containerView.trailingAnchor, constant: -16),

            activityIndicator.centerXAnchor.constraint(equalTo: containerView.centerXAnchor),
            activityIndicator.centerYAnchor.constraint(equalTo: containerView.centerYAnchor),

            checkmarkImageView.centerXAnchor.constraint(equalTo: containerView.centerXAnchor),
            checkmarkImageView.centerYAnchor.constraint(equalTo: containerView.centerYAnchor),

            errorImageView.centerXAnchor.constraint(equalTo: containerView.centerXAnchor),
            errorImageView.centerYAnchor.constraint(equalTo: containerView.centerYAnchor),

            statusLabel.bottomAnchor.constraint(equalTo: containerView.bottomAnchor, constant: -20),
            statusLabel.leadingAnchor.constraint(equalTo: containerView.leadingAnchor, constant: 16),
            statusLabel.trailingAnchor.constraint(equalTo: containerView.trailingAnchor, constant: -16),
        ])

        activityIndicator.startAnimating()
    }

    private func extractAndSaveRecipe() {
        guard let extensionItem = extensionContext?.inputItems.first as? NSExtensionItem,
              let itemProviders = extensionItem.attachments else {
            showError("No content to share")
            return
        }

        // Look for URL
        let urlType = UTType.url.identifier

        for provider in itemProviders {
            if provider.hasItemConformingToTypeIdentifier(urlType) {
                provider.loadItem(forTypeIdentifier: urlType, options: nil) { [weak self] (item, error) in
                    DispatchQueue.main.async {
                        if let error = error {
                            self?.showError(error.localizedDescription)
                            return
                        }

                        var urlString: String?

                        if let url = item as? URL {
                            urlString = url.absoluteString
                        } else if let data = item as? Data, let url = URL(dataRepresentation: data, relativeTo: nil) {
                            urlString = url.absoluteString
                        }

                        if let urlString = urlString {
                            self?.saveRecipe(from: urlString)
                        } else {
                            self?.showError("Could not extract URL")
                        }
                    }
                }
                return
            }
        }

        showError("No URL found")
    }

    private func saveRecipe(from urlString: String) {
        guard let url = URL(string: apiURL) else {
            showError("Invalid API URL")
            return
        }

        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")

        let body: [String: Any] = [
            "url": urlString,
            "save": true
        ]

        do {
            request.httpBody = try JSONSerialization.data(withJSONObject: body)
        } catch {
            showError("Failed to create request")
            return
        }

        URLSession.shared.dataTask(with: request) { [weak self] data, response, error in
            DispatchQueue.main.async {
                if let error = error {
                    self?.showError(error.localizedDescription)
                    return
                }

                guard let httpResponse = response as? HTTPURLResponse else {
                    self?.showError("Invalid response")
                    return
                }

                if httpResponse.statusCode == 200 {
                    self?.showSuccess()
                } else {
                    var errorMessage = "Failed to save recipe"
                    if let data = data,
                       let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
                       let apiError = json["error"] as? String {
                        errorMessage = apiError
                    }
                    self?.showError(errorMessage)
                }
            }
        }.resume()
    }

    private func showSuccess() {
        activityIndicator.stopAnimating()
        activityIndicator.isHidden = true
        checkmarkImageView.isHidden = false
        statusLabel.text = "Recipe saved!"
        statusLabel.textColor = .systemGreen

        DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) { [weak self] in
            self?.extensionContext?.completeRequest(returningItems: nil)
        }
    }

    private func showError(_ message: String) {
        activityIndicator.stopAnimating()
        activityIndicator.isHidden = true
        errorImageView.isHidden = false
        statusLabel.text = message
        statusLabel.textColor = .systemRed

        DispatchQueue.main.asyncAfter(deadline: .now() + 2.0) { [weak self] in
            self?.extensionContext?.cancelRequest(withError: NSError(domain: "RecipeBook", code: -1))
        }
    }
}
