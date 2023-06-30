// Dart imports:
import 'dart:developer';
import 'dart:typed_data';

// Flutter imports:
import 'package:flutter/material.dart';

// Package imports:
import 'package:firebase_storage/firebase_storage.dart';
import 'package:get/get.dart';

// Project imports:
import '../controllers/options_controller.dart';

class ProfilePicture extends GetView<PreferencesController> {
  ProfilePicture(this.userId, {super.key});

  final String userId;

  final Rx<Uint8List?> bytes = Rx<Uint8List?>(null);

  @override
  Widget build(BuildContext context) {
    var imageRef =
        (FirebaseStorage.instance.ref('profile-picture/${userId}_100x100'));

    imageRef.getData().then((value) => bytes(value)).catchError((onError) {
      log("profile picture not found");
    });

    return Obx(() {
      Uint8List? imageBytes = bytes();

      return Row(
        children: [
          SizedBox(
            height: 100,
            width: 100,
            child: imageBytes != null
                ? Image(image: MemoryImage(imageBytes))
                : const Text("No Profile Picture"),
          ),
        ],
      );
    });
  }
}