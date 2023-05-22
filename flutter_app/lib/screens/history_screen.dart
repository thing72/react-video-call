// Dart imports:

// Flutter imports:
import 'package:flutter/material.dart';

// Package imports:
import 'package:get/get.dart';

// Project imports:
import '../controllers/options_controller.dart';
import '../widgets/history_widget.dart';
import '../widgets/left_nav_widget.dart';
import '../widgets/loadging_widgets.dart';

class HistoryScreen extends GetView<OptionsController> {
  const HistoryScreen({super.key});

  @override
  Widget build(BuildContext context) {
    Widget history = Container(
        alignment: Alignment.topCenter,
        decoration: BoxDecoration(
          color: Colors.teal,
          borderRadius: BorderRadius.circular(12),
        ),
        padding: const EdgeInsets.all(20),
        margin: const EdgeInsets.all(20),
        constraints: const BoxConstraints(
          maxWidth: 1000,
        ),
        child: false
            ? connectingWidget
            : Column(
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  const Text(
                    "History",
                    style: TextStyle(
                      fontSize: 35.0,
                      fontWeight: FontWeight.bold,
                      color: Colors.black,
                    ),
                  ),
                  const Divider(),
                  HistoryWidget()
                ],
              ));

    return LeftNav(
        title: 'History',
        body: Center(
            child: SingleChildScrollView(
                child: Column(
          children: [history],
        ))));
  }
}
