import 'package:flutter/material.dart';

abstract final class CareNestColors {
  static const forest = Color(0xFF24594A);
  static const ink = Color(0xFF17342D);
  static const sage = Color(0xFF7DA690);
  static const mint = Color(0xFFE4F0EA);
  static const cream = Color(0xFFF7F5EF);
  static const coral = Color(0xFFD77B61);
  static const gold = Color(0xFFD1AD59);
}

abstract final class CareNestTheme {
  static ThemeData get light => _theme(
    ColorScheme.fromSeed(
      seedColor: CareNestColors.forest,
      brightness: Brightness.light,
      surface: CareNestColors.cream,
    ),
  );

  static ThemeData get dark => _theme(
    ColorScheme.fromSeed(
      seedColor: CareNestColors.sage,
      brightness: Brightness.dark,
      surface: const Color(0xFF111518),
    ),
  );

  static ThemeData _theme(ColorScheme scheme) {
    final border = OutlineInputBorder(
      borderRadius: BorderRadius.circular(14),
      borderSide: BorderSide(color: scheme.outlineVariant),
    );
    return ThemeData(
      useMaterial3: true,
      colorScheme: scheme,
      scaffoldBackgroundColor: scheme.surface,
      appBarTheme: AppBarTheme(
        elevation: 0,
        centerTitle: false,
        backgroundColor: scheme.surface,
        foregroundColor: scheme.onSurface,
      ),
      cardTheme: CardThemeData(
        elevation: 0,
        margin: EdgeInsets.zero,
        color: scheme.surfaceContainerLowest,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
          side: BorderSide(color: scheme.outlineVariant),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: scheme.surfaceContainerLowest,
        border: border,
        enabledBorder: border,
        focusedBorder: border.copyWith(
          borderSide: BorderSide(color: scheme.primary, width: 2),
        ),
        contentPadding: const EdgeInsets.symmetric(
          horizontal: 16,
          vertical: 15,
        ),
      ),
      navigationBarTheme: NavigationBarThemeData(
        height: 72,
        indicatorColor: scheme.primaryContainer,
        labelBehavior: NavigationDestinationLabelBehavior.alwaysShow,
      ),
      filledButtonTheme: FilledButtonThemeData(
        style: FilledButton.styleFrom(
          minimumSize: const Size(0, 52),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(14),
          ),
          textStyle: const TextStyle(fontWeight: FontWeight.w700),
        ),
      ),
      chipTheme: ChipThemeData(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        side: BorderSide(color: scheme.outlineVariant),
      ),
    );
  }
}
