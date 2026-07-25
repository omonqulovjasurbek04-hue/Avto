import '../generated/scenario.g.dart';

/// Blends two 0xAARRGGBB colours. [t] = 0 keeps [a], 1 gives [b].
int mixColour(int a, int b, double t) {
  int channel(int shift) {
    final ca = (a >> shift) & 0xFF;
    final cb = (b >> shift) & 0xFF;
    return (ca + (cb - ca) * t).round().clamp(0, 255);
  }

  return (channel(24) << 24) | (channel(16) << 16) | (channel(8) << 8) | channel(0);
}

/// Colours as 0xAARRGGBB. Chosen for legibility on small phone screens in
/// daylight, which is where the exam gets studied.
class Palette {
  final int ground;
  final int asphalt;
  final int kerb;
  final int laneMarking;
  final int stopLine;
  final int crosswalk;
  final int tramRail;
  final int vehicleBody;
  final int playerBody;
  final int tramBody;
  final int windshield;
  final int outline;

  /// Full-canvas tint painted above everything but the HUD. Zero means none.
  final int atmosphere;

  const Palette({
    required this.ground,
    required this.asphalt,
    required this.kerb,
    required this.laneMarking,
    required this.stopLine,
    required this.crosswalk,
    required this.tramRail,
    required this.vehicleBody,
    required this.playerBody,
    required this.tramBody,
    required this.windshield,
    required this.outline,
    this.atmosphere = 0,
  });

  static const day = Palette(
    ground: 0xFFDCE3D5,
    asphalt: 0xFF565C63,
    kerb: 0xFF9AA1A8,
    laneMarking: 0xFFEDEFF1,
    stopLine: 0xFFF5F6F7,
    crosswalk: 0xFFF2F4F5,
    tramRail: 0xFF3A3E43,
    vehicleBody: 0xFF3E7BD1,
    playerBody: 0xFFD94F3D,
    tramBody: 0xFFE0A32E,
    windshield: 0xFF1E2833,
    outline: 0xFF23282E,
  );

  static const night = Palette(
    ground: 0xFF1B2029,
    asphalt: 0xFF2E343C,
    kerb: 0xFF4A515A,
    laneMarking: 0xFFC8CDD3,
    stopLine: 0xFFD5DAE0,
    crosswalk: 0xFFC8CDD3,
    tramRail: 0xFF14181D,
    vehicleBody: 0xFF4A8AE0,
    playerBody: 0xFFE4604D,
    tramBody: 0xFFE8B44A,
    windshield: 0xFF0C1118,
    outline: 0xFF0A0D11,
  );

  static const dusk = Palette(
    ground: 0xFF9DA391,
    asphalt: 0xFF454B54,
    kerb: 0xFF7B828B,
    laneMarking: 0xFFDDE1E6,
    stopLine: 0xFFE4E8EC,
    crosswalk: 0xFFDDE1E6,
    tramRail: 0xFF23282E,
    vehicleBody: 0xFF4480D6,
    playerBody: 0xFFDE5744,
    tramBody: 0xFFE0A83C,
    windshield: 0xFF141C25,
    outline: 0xFF161A1F,
  );

  /// Applies [f] to every surface colour, leaving [atmosphere] alone.
  Palette mapColours(int Function(int) f) => Palette(
        ground: f(ground),
        asphalt: f(asphalt),
        kerb: f(kerb),
        laneMarking: f(laneMarking),
        stopLine: f(stopLine),
        crosswalk: f(crosswalk),
        tramRail: f(tramRail),
        vehicleBody: f(vehicleBody),
        playerBody: f(playerBody),
        tramBody: f(tramBody),
        windshield: f(windshield),
        outline: f(outline),
        atmosphere: atmosphere,
      );

  static Palette _base(TimeOfDay time) => switch (time) {
        TimeOfDay.day => day,
        TimeOfDay.night => night,
        TimeOfDay.dusk => dusk,
      };

  /// Weather is a modifier on the time-of-day palette, not a separate table -
  /// so night + rain composes without a combinatorial explosion of constants.
  static Palette forConditions(Conditions? c) {
    final conditions = c ?? const Conditions();
    final base = _base(conditions.time);

    return switch (conditions.weather) {
      Weather.clear => base,

      // Wet asphalt is darker and cooler; everything else loses a little
      // contrast behind the spray.
      Weather.rain => base.mapColours((x) => mixColour(x, 0xFF2A3138, 0.18)).copyWith(
            asphalt: mixColour(base.asphalt, 0xFF20262C, 0.45),
            atmosphere: 0x22334455,
          ),

      // Snow lightens the surroundings far more than the carriageway, and
      // markings all but disappear.
      Weather.snow => base.copyWith(
          ground: mixColour(base.ground, 0xFFF4F7FA, 0.75),
          asphalt: mixColour(base.asphalt, 0xFFB6BEC6, 0.30),
          kerb: mixColour(base.kerb, 0xFFEFF3F7, 0.55),
          laneMarking: mixColour(base.laneMarking, 0xFFB9C1C9, 0.45),
          stopLine: mixColour(base.stopLine, 0xFFB9C1C9, 0.35),
          crosswalk: mixColour(base.crosswalk, 0xFFB9C1C9, 0.35),
          atmosphere: 0x1AFFFFFF,
        ),

      // Fog flattens everything toward mid-grey and adds a veil on top.
      Weather.fog =>
        base.mapColours((x) => mixColour(x, 0xFF9AA0A6, 0.34)).copyWith(atmosphere: 0x3CC9CED3),
    };
  }

  Palette copyWith({
    int? ground,
    int? asphalt,
    int? kerb,
    int? laneMarking,
    int? stopLine,
    int? crosswalk,
    int? tramRail,
    int? vehicleBody,
    int? playerBody,
    int? tramBody,
    int? windshield,
    int? outline,
    int? atmosphere,
  }) =>
      Palette(
        ground: ground ?? this.ground,
        asphalt: asphalt ?? this.asphalt,
        kerb: kerb ?? this.kerb,
        laneMarking: laneMarking ?? this.laneMarking,
        stopLine: stopLine ?? this.stopLine,
        crosswalk: crosswalk ?? this.crosswalk,
        tramRail: tramRail ?? this.tramRail,
        vehicleBody: vehicleBody ?? this.vehicleBody,
        playerBody: playerBody ?? this.playerBody,
        tramBody: tramBody ?? this.tramBody,
        windshield: windshield ?? this.windshield,
        outline: outline ?? this.outline,
        atmosphere: atmosphere ?? this.atmosphere,
      );
}
