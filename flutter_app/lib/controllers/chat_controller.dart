// Package imports:
import 'package:flutter_app/controllers/home_controller.dart';
import 'package:get/get.dart';

import '../models/chat_event_model.dart';
import '../services/auth_service.dart';
import '../services/options_service.dart';

// Project imports:

class ChatController extends GetxController {
  ChatController();

  final RxMap<String, RxList<ChatEventModel>> chatMap = RxMap();
  final OptionsService optionsService = Get.find();
  final AuthService authService = Get.find();

  appendChat(String userId, dynamic chatEvent) {
    RxList<ChatEventModel> chatRoom = loadChat(userId);

    chatRoom.add(chatEvent);
  }

  RxList<ChatEventModel> loadChat(String userId) {
    RxList<ChatEventModel> chatRoom = chatMap.putIfAbsent(userId, () {
      final HomeController homeController = Get.find();

      var temp = RxList<ChatEventModel>();

      optionsService.loadChat(userId).then((loadedMessages) {
        temp.addAll(loadedMessages);
        homeController.listenEvent("chat", (data) {
          ChatEventModel chatEvent = ChatEventModel.fromJson(data);

          if (chatEvent.source == userId) {
            temp.add(data);
            return "good";
          }
        });
      });

      return temp;
    });

    return chatRoom;
  }

  sendMessage(String userId, String message) {
    final HomeController homeController = Get.find();

    dynamic chatEvent = {
      "source": authService.getUser().uid,
      "target": userId,
      "message": message,
    };

    homeController.emitEvent("chat", chatEvent);
  }
}
