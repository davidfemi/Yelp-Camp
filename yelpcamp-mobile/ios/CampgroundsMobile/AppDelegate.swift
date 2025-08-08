import Expo
// @generated begin Intercom header - expo prebuild (DO NOT MODIFY) sync-f6fd06e08d30c2c66260b72f45072d393b20a2dc
import intercom_react_native
// @generated end Intercom header
import React
import ReactAppDependencyProvider

// @generated begin react-native-maps-import - expo prebuild (DO NOT MODIFY) sync-bee50fec513f89284e0fa3f5d935afdde33af98f
#if canImport(GoogleMaps)
import GoogleMaps
#endif
// @generated end react-native-maps-import
@UIApplicationMain
public class AppDelegate: ExpoAppDelegate {
  var window: UIWindow?

  var reactNativeDelegate: ExpoReactNativeFactoryDelegate?
  var reactNativeFactory: RCTReactNativeFactory?

  public override func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {
    let delegate = ReactNativeDelegate()
    let factory = ExpoReactNativeFactory(delegate: delegate)
    delegate.dependencyProvider = RCTAppDependencyProvider()

    reactNativeDelegate = delegate
    reactNativeFactory = factory
    bindReactNativeFactory(factory)

#if os(iOS) || os(tvOS)
    window = UIWindow(frame: UIScreen.main.bounds)
    factory.startReactNative(
      withModuleName: "main",
      in: window,
      launchOptions: launchOptions)
#endif

// @generated begin react-native-maps-init - expo prebuild (DO NOT MODIFY) sync-91171d055083a6dc70ca12eb9669d17a7ed33217
#if canImport(GoogleMaps)
GMSServices.provideAPIKey("AIzaSyBQs0jsW14VYtMjYVIyevdoP3jdxHYpshA")
#endif
// @generated end react-native-maps-init
    IntercomModule.initialize("ios_sdk-d5d209d7d2a2c501dc9c9e5042f47f9832088f76", withAppId: "hqd6b4qh")
  return super.application(application, didFinishLaunchingWithOptions: launchOptions)
  }

  // Linking API
  public override func application(
    _ app: UIApplication,
    open url: URL,
    options: [UIApplication.OpenURLOptionsKey: Any] = [:]
  ) -> Bool {
    return super.application(app, open: url, options: options) || RCTLinkingManager.application(app, open: url, options: options)
  }

  // Universal Links
  public override func application(
    _ application: UIApplication,
    continue userActivity: NSUserActivity,
    restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void
  ) -> Bool {
    let result = RCTLinkingManager.application(application, continue: userActivity, restorationHandler: restorationHandler)
    return super.application(application, continue: userActivity, restorationHandler: restorationHandler) || result
  }
}

class ReactNativeDelegate: ExpoReactNativeFactoryDelegate {
  // Extension point for config-plugins

  override func sourceURL(for bridge: RCTBridge) -> URL? {
    // needed to return the correct URL for expo-dev-client.
    bridge.bundleURL ?? bundleURL()
  }

  override func bundleURL() -> URL? {
#if DEBUG
    return RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: ".expo/.virtual-metro-entry")
#else
    return Bundle.main.url(forResource: "main", withExtension: "jsbundle")
#endif
  }
}
