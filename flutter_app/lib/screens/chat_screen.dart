// Flutter imports:
import 'package:flutter/material.dart';

// Package imports:
import 'package:get/get.dart';

// Project imports:
import '../controllers/auth_controller.dart';
import '../controllers/chat_controller.dart';
import '../routes/app_pages.dart';
import '../utils/utils.dart';
import '../widgets/app_menu_widget.dart';

class ChatScreen extends GetView<ChatController> {
  const ChatScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return AppMenu(
        title: 'Chat',
        body: const Center(
            child: Column(
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
              Text(
                "History",
                style: TextStyle(
                  fontSize: 35.0,
                  fontWeight: FontWeight.bold,
                ),
              ),
              Divider(),
              Text("Test")
            ])));
  }
}
