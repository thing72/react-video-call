// Flutter imports:
import 'package:flutter/material.dart';

// Package imports:
import 'package:get/get.dart';

// Project imports:
import '../controllers/auth_controller.dart';
import '../routes/app_pages.dart';
import '../utils/utils.dart';

class LoginScreen extends GetView<AuthController> {
  const LoginScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        const Text("Login..."),
        ElevatedButton(
          child: const Text("Login Anonymous"),
          onPressed: () async {
            controller
                .signInAnonymously()
                .then((value) => Get.offAllNamed(Routes.HOME))
                .catchError((err) {
              errorSnackbar("Error", err.toString());
            });
          },
        ),
        ElevatedButton(
          child: const Text("Login Google"),
          onPressed: () async {
            controller
                .signinWithGoogle()
                .then((value) => Get.offAllNamed(Routes.HOME))
                .catchError((err) {
              errorSnackbar("Error", err.toString());
            });
          },
        )
      ],
    );
  }
}
