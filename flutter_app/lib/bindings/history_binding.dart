// Package imports:
import 'package:get/get.dart';

// Project imports:
import 'package:flutter_app/services/options_service.dart';
import '../controllers/history_controller.dart';

class HistoryBinding extends Bindings {
  @override
  void dependencies() {
    Get.put<HistoryController>(
        HistoryController(Get.put<OptionsService>(OptionsService())));
  }
}
