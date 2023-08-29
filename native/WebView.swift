import SwiftUI
import WebKit

private class Ctrl: NSObject, WKScriptMessageHandler {
    let webView: WKWebView;

    public init(webView _webView: WKWebView) {
        webView = _webView
        super.init()
        foreign.send = send
    }
    
    func send(command: Command<Browser>) {
        print("send \(command)")
        self.webView.evaluateJavaScript("document.dispatchEvent(new CustomEvent('jirecv', { detail: \(encodeOr(command: command)) }));")
    }
    
    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        print("RECV \(message.name)")
        if message.name == "nativeCallback" {
            if let messageBody = message.body as? String {
                let decoder = JSONDecoder()
                if let command: Command<Native> = try? decoder.decode(Command<Native>.self, from: Data(messageBody.utf8)) {
                    print("recvCommand \(command)")
                    foreign.recvCommand(command: command)
                } else {
                    print("BUG: Error parsing message: \(messageBody)")
                }
            } else {
                print("BUG: no message body")
            }
        } else if message.name == "nativeLogger" {
            if let messageBody = message.body as? String {
                print("[JavaScript] \(messageBody)")
            }
        }
    }
}

struct WebView: UIViewRepresentable {
 
    func makeUIView(context: Context) -> WKWebView {
        let config = WKWebViewConfiguration()
        let webView = WKWebView(frame: .zero, configuration: config)
        let ctrl = Ctrl(webView: webView)
        config.userContentController.add(ctrl, name: "nativeCallback")
        config.userContentController.add(ctrl, name: "nativeLogger")
        return webView
    }
 
    func updateUIView(_ webView: WKWebView, context: Context) {
        let url = Bundle.main.url(forResource: "index", withExtension: "html", subdirectory: "static")!
        webView.loadFileURL(url, allowingReadAccessTo: url)
        let request = URLRequest(url: url)
        webView.load(request)
    }
}

