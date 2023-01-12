// File generated by FlutterFire CLI.
// ignore_for_file: lines_longer_than_80_chars, avoid_classes_with_only_static_members
import 'package:firebase_core/firebase_core.dart' show FirebaseOptions;
import 'package:flutter/foundation.dart'
    show defaultTargetPlatform, kIsWeb, TargetPlatform;

/// Default [FirebaseOptions] for use with your Firebase apps.
///
/// Example:
/// ```dart
/// import 'firebase_options.dart';
/// // ...
/// await Firebase.initializeApp(
///   options: DefaultFirebaseOptions.currentPlatform,
/// );
/// ```
class DefaultFirebaseOptions {
  static FirebaseOptions get currentPlatform {
    if (kIsWeb) {
      return web;
    }
    switch (defaultTargetPlatform) {
      case TargetPlatform.android:
        return android;
      case TargetPlatform.iOS:
        return ios;
      case TargetPlatform.macOS:
        throw UnsupportedError(
          'DefaultFirebaseOptions have not been configured for macos - '
          'you can reconfigure this by running the FlutterFire CLI again.',
        );
      case TargetPlatform.windows:
        throw UnsupportedError(
          'DefaultFirebaseOptions have not been configured for windows - '
          'you can reconfigure this by running the FlutterFire CLI again.',
        );
      case TargetPlatform.linux:
        throw UnsupportedError(
          'DefaultFirebaseOptions have not been configured for linux - '
          'you can reconfigure this by running the FlutterFire CLI again.',
        );
      default:
        throw UnsupportedError(
          'DefaultFirebaseOptions are not supported for this platform.',
        );
    }
  }

  static const FirebaseOptions web = FirebaseOptions(
    apiKey: 'AIzaSyDYpgOSidu-ug4SJ3I6ktocbBQhA91DDR0',
    appId: '1:619217777312:web:2ef7fa42fd9bd1bed0cfc5',
    messagingSenderId: '619217777312',
    projectId: 'react-video-call-thing72',
    authDomain: 'react-video-call-thing72.firebaseapp.com',
    storageBucket: 'react-video-call-thing72.appspot.com',
  );

  static const FirebaseOptions android = FirebaseOptions(
    apiKey: 'AIzaSyB9SplYhSsBHz6j2JucKx6SSEtSI-llng4',
    appId: '1:619217777312:android:7b2974724d142e3bd0cfc5',
    messagingSenderId: '619217777312',
    projectId: 'react-video-call-thing72',
    storageBucket: 'react-video-call-thing72.appspot.com',
  );

  static const FirebaseOptions ios = FirebaseOptions(
    apiKey: 'AIzaSyBY0OUg18y9mLKq2zcgO51G4ih5wlC_yaY',
    appId: '1:619217777312:ios:c2e305e9e4d2ca8fd0cfc5',
    messagingSenderId: '619217777312',
    projectId: 'react-video-call-thing72',
    storageBucket: 'react-video-call-thing72.appspot.com',
    iosClientId: '619217777312-tp9gb6q5cl100ujj19nga53bj72cqa3i.apps.googleusercontent.com',
    iosBundleId: 'com.thing72.random-video-call',
  );
}
