// Flutter imports:
import 'package:flutter/material.dart';

// Package imports:
import 'package:get/get.dart';

// Project imports:
import 'package:flutter_app/models/notification_model.dart';
import '../controllers/notifications_controller.dart';

class NotificationsButton extends GetView<NotificationsController> {
  const NotificationsButton({super.key});

  OverlayEntry _createOverlayEntry() {
    OverlayEntry? overlay;

    final ScrollController scrollController = ScrollController();

    // scrollController.addListener(() async {
    //   print(
    //       "scroll position ${scrollController.position.pixels} ${scrollController.position.maxScrollExtent} ${scrollController.position.pixels == scrollController.position.maxScrollExtent}");
    //   if (scrollController.position.pixels ==
    //       scrollController.position.maxScrollExtent) {
    //     // await controller.loadMoreNotifications();
    //   }
    // });

    overlay = OverlayEntry(
        builder: (context) => Stack(children: [
              // This Positioned.fill covers the entire screen with a translucent color
              Positioned.fill(
                child: GestureDetector(
                    behavior: HitTestBehavior.opaque,
                    onTap: () {
                      overlay?.remove();
                    },
                    child: Container(color: Colors.transparent)),
              ),
              // The actual overlay content
              Positioned(
                  top: 0,
                  right: 0,
                  bottom: 0,
                  width: 200,
                  child: Material(
                    color: Colors.cyan,
                    child: Column(children: [
                      Expanded(
                          child: Obx(() => ListView.builder(
                              controller: scrollController,
                              itemCount: controller.notifications().length + 1,
                              itemBuilder: (BuildContext context, int index) {
                                if (index == controller.notificationTotal()) {
                                  return const Text("No more Notifications.");
                                } else if (index >=
                                    controller.notifications().length) {
                                  controller.loadMoreNotifications();
                                  return Text(
                                      "loading total ${controller.notificationTotal()} length ${controller.notifications().length}");
                                } else {
                                  return NotificationItem(
                                      controller
                                          .notifications()
                                          .entries
                                          .toList()[index]
                                          .key,
                                      controller
                                          .notifications()
                                          .entries
                                          .toList()[index]
                                          .value);
                                }
                              })))
                    ]),
                  )),
            ]));
    return overlay;
  }

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Obx(() {
          return IconButton(
            icon: Badge(
              label: Text(controller.unread.toString()),
              isLabelVisible: controller.unread() > 0,
              child: const Icon(Icons.notifications),
            ),
            onPressed: () {
              print("pressed");
              Overlay.of(context).insert(_createOverlayEntry());
            },
          );
        })
      ],
    );
  }
}

class NotificationItem extends GetView<NotificationsController> {
  final NotificationModel notification;
  final String id;

  const NotificationItem(this.id, this.notification, {super.key});

  @override
  Widget build(BuildContext context) {
    return Row(children: [
      Expanded(
          child: Container(
              padding: const EdgeInsets.all(2), // Padding inside the container
              margin: const EdgeInsets.all(2), // Margin around the container
              decoration: BoxDecoration(
                color: notification.read ?? false
                    ? null
                    : Colors.blue, // Background color
                borderRadius: BorderRadius.circular(2), // Rounded corners
                // border: const Border(
                //     bottom: BorderSide(
                //       color: Colors.black, // Border color
                //       width: 2, // Border width
                //     ),
                //     top: BorderSide.none,
                //     left: BorderSide.none,
                //     right: BorderSide.none),
                border: Border.all(
                  color: Colors.black, // Border color
                  width: 2, // Border width
                ),
              ),
              child: Column(
                children: [
                  Text(
                    notification.title ?? "No title.",
                  ),
                  Text(notification.description ?? "No description.")
                ],
              ))),
      // IconButton(
      //     onPressed: () {
      //       controller.archiveNotification(id);
      //       Navigator.pop(context);
      //     },
      //     icon: const Icon(Icons.close))
    ]);
  }
}

class NotificationsLoadMore extends GetView<NotificationsController> {
  const NotificationsLoadMore({super.key});

  @override
  Widget build(BuildContext context) {
    return TextButton(
      onPressed: () {
        print("loading more");
        controller.addNotification();
      },
      child: const Text("Load More."),
    );
  }
}
