import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'main.dart';

class YHQApp extends StatelessWidget {
  const YHQApp({super.key});

  @override
  Widget build(BuildContext context) {
    return ProviderScope(
      child: MaterialApp(
        title: 'Avto Qoidalar (YHQ)',
        theme: ThemeData(
          colorSchemeSeed: const Color(0xFF3E7BD1),
          brightness: Brightness.dark,
          useMaterial3: true,
        ),
        home: const ScenarioListScreen(),
      ),
    );
  }
}
