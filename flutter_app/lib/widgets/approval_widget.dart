// Flutter imports:
import 'package:flutter/material.dart';

// Package imports:
import 'package:get/get.dart';

// Project imports:
import 'package:flutter_app/widgets/profile_picture.dart';
import '../controllers/home_controller.dart';
import '../models/user_model.dart';
import '../services/local_preferences_service.dart';

class ApprovalWidget extends GetView<HomeController> {
  final String userId;
  final Function callback;
  final LocalPreferences localPreferences = Get.find();

  final RxBool sent = false.obs;

  final Rx<UserDataModel?> userData = Rx(null);

  ApprovalWidget(
    this.userId,
    this.callback, {
    super.key,
  }) {
    sent(localPreferences.autoAccept());
  }

  @override
  Widget build(BuildContext context) {
    controller.optionsService
        .getUserData(userId)
        .then((value) => userData(value));

    return Obx(
      () => Column(crossAxisAlignment: CrossAxisAlignment.center, children: [
        const Text(
          "Appove user",
          style: TextStyle(
            fontSize: 35.0,
            fontWeight: FontWeight.bold,
          ),
        ),
        const Divider(),
        Text(userData()?.displayName ?? "Loading..."),
        Text(userData()?.description ?? "Loading..."),
        ProfilePicture(userId),
        TextButton(
          onPressed: sent()
              ? null
              : () {
                  callback({"approve": false});
                  sent(true);
                },
          child: const Text('Reject'),
        ),
        TextButton(
          onPressed: sent()
              ? null
              : () {
                  callback({"approve": true});
                  sent(true);
                },
          child: const Text('Approve'),
        ),
      ]),
    );
  }
}
