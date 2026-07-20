import '../generated/scenario.g.dart';

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

  static Palette forConditions(Conditions? c) =>
      (c?.time == TimeOfDay.night) ? night : day;
}
