// Dart imports:
import 'dart:typed_data';

// Flutter imports:
import 'package:flutter/material.dart';

// Package imports:
import 'package:cached_network_image/cached_network_image.dart';
import 'package:firebase_storage/firebase_storage.dart';
import 'package:get/get.dart';

// Project imports:
import '../controllers/options_controller.dart';
import '../services/cache_service.dart';

class ProfilePicture extends GetView<PreferencesController> {
  ProfilePicture(this.userId, {super.key});

  final String userId;
  final Rx<Widget> photoWidget = Rx(const Icon(Icons.no_photography_sharp));

  final Rx<Uint8List?> bytes = Rx<Uint8List?>(null);
  final CacheService cacheService = Get.find();

  @override
  Widget build(BuildContext context) {
    cacheService.getOrWrite<String?>('profile-picture/${userId}_100x100',
        () async {
      var imageRef =
          (FirebaseStorage.instance.ref('profile-picture/${userId}_100x100'));

      try {
        return await imageRef.getDownloadURL();
      } catch (err) {
        return null;
      }
    }).then((photoUrl) {
      if (photoUrl == null) throw "No photo";
      // print("photo url: $value");
      return photoWidget(CachedNetworkImage(
        imageUrl: photoUrl,
        placeholder: (context, url) => const CircularProgressIndicator(),
        errorWidget: (context, url, error) {
          return const Icon(Icons.error);
        },
      ));
    }).catchError((err) {
      // print("pp catchError");
      return photoWidget(const Icon(Icons.no_photography_sharp));
    });

    return Obx(() {
      return Row(
        children: [
          SizedBox(
            height: 100,
            width: 100,
            child: photoWidget(),
          )
        ],
      );
    });
  }
}
