import 'package:firebase_auth/firebase_auth.dart';
import 'package:get/get.dart';

import '../services/auth_service.dart';

class AuthController extends GetxController {
  final AuthService _authService;

  AuthController(this._authService);

  // Called immediately after the contoller is allocated in memory.
  @override
  void onInit() {
    super.onInit();
  }

  Future signInAnonymously() async {
    await FirebaseAuth.instance.signInAnonymously();
  }

  Future signinWithGoogle() async {
    GoogleAuthProvider googleProvider = GoogleAuthProvider();

    googleProvider
        .addScope('https://www.googleapis.com/auth/contacts.readonly');
    googleProvider.setCustomParameters({'login_hint': 'user@example.com'});

    // Once signed in, return the UserCredential
    UserCredential userCredential =
        await FirebaseAuth.instance.signInWithPopup(googleProvider);
  }
}
