// GENERATED FILE - DO NOT EDIT.
// Source: schema/scenario.schema.json
// Regenerate with: node tools/codegen.js

// ignore_for_file: unnecessary_cast, prefer_const_constructors

/// SceneType
enum SceneType {
  crossroads4way("crossroads_4way"),
  tJunction("t_junction"),
  yJunction("y_junction"),
  roundabout("roundabout"),
  straightRoad("straight_road"),
  overtaking("overtaking"),
  pedestrianCrossing("pedestrian_crossing"),
  railwayCrossing("railway_crossing"),
  narrowRoad("narrow_road"),
  parkingStopping("parking_stopping"),
  residentialYard("residential_yard"),
  tunnel("tunnel");

  const SceneType(this.wire);

  /// The exact string used in scenario JSON.
  final String wire;

  String toJson() => wire;

  static SceneType fromJson(String v) => values.firstWhere(
        (e) => e.wire == v,
        orElse: () => throw FormatException('unknown SceneType: $v'),
      );
}

/// Dir
enum Dir {
  n("N"),
  s("S"),
  e("E"),
  w("W"),
  ne("NE"),
  nw("NW"),
  se("SE"),
  sw("SW");

  const Dir(this.wire);

  /// The exact string used in scenario JSON.
  final String wire;

  String toJson() => wire;

  static Dir fromJson(String v) => values.firstWhere(
        (e) => e.wire == v,
        orElse: () => throw FormatException('unknown Dir: $v'),
      );
}

/// LightPlacement
enum LightPlacement {
  n("N"),
  s("S"),
  e("E"),
  w("W"),
  ne("NE"),
  nw("NW"),
  se("SE"),
  sw("SW"),
  all("all");

  const LightPlacement(this.wire);

  /// The exact string used in scenario JSON.
  final String wire;

  String toJson() => wire;

  static LightPlacement fromJson(String v) => values.firstWhere(
        (e) => e.wire == v,
        orElse: () => throw FormatException('unknown LightPlacement: $v'),
      );
}

/// Priority
enum Priority {
  main("main"),
  secondary("secondary"),
  equal("equal");

  const Priority(this.wire);

  /// The exact string used in scenario JSON.
  final String wire;

  String toJson() => wire;

  static Priority fromJson(String v) => values.firstWhere(
        (e) => e.wire == v,
        orElse: () => throw FormatException('unknown Priority: $v'),
      );
}

/// ActorKind
enum ActorKind {
  car("car"),
  truck("truck"),
  bus("bus"),
  tram("tram"),
  motorcycle("motorcycle"),
  bicycle("bicycle"),
  pedestrian("pedestrian"),
  emergency("emergency");

  const ActorKind(this.wire);

  /// The exact string used in scenario JSON.
  final String wire;

  String toJson() => wire;

  static ActorKind fromJson(String v) => values.firstWhere(
        (e) => e.wire == v,
        orElse: () => throw FormatException('unknown ActorKind: $v'),
      );
}

/// ActorRole
enum ActorRole {
  player("player"),
  traffic("traffic");

  const ActorRole(this.wire);

  /// The exact string used in scenario JSON.
  final String wire;

  String toJson() => wire;

  static ActorRole fromJson(String v) => values.firstWhere(
        (e) => e.wire == v,
        orElse: () => throw FormatException('unknown ActorRole: $v'),
      );
}

/// OutcomeType
enum OutcomeType {
  collision("collision"),
  priorityViolation("priority_violation"),
  signViolation("sign_violation"),
  markingViolation("marking_violation"),
  unnecessaryWait("unnecessary_wait"),
  unsafeButLegal("unsafe_but_legal");

  const OutcomeType(this.wire);

  /// The exact string used in scenario JSON.
  final String wire;

  String toJson() => wire;

  static OutcomeType fromJson(String v) => values.firstWhere(
        (e) => e.wire == v,
        orElse: () => throw FormatException('unknown OutcomeType: $v'),
      );
}

/// LightState
enum LightState {
  off("off"),
  red("red"),
  yellow("yellow"),
  green("green"),
  greenBlink("green_blink"),
  yellowBlink("yellow_blink");

  const LightState(this.wire);

  /// The exact string used in scenario JSON.
  final String wire;

  String toJson() => wire;

  static LightState fromJson(String v) => values.firstWhere(
        (e) => e.wire == v,
        orElse: () => throw FormatException('unknown LightState: $v'),
      );
}

/// MarkingType
enum MarkingType {
  stopLine("stop_line"),
  giveWayLine("give_way_line"),
  crosswalk("crosswalk"),
  solidLine("solid_line"),
  dashedLine("dashed_line"),
  doubleSolid("double_solid"),
  stopBox("stop_box"),
  noStopping("no_stopping"),
  noParking("no_parking"),
  laneArrow("lane_arrow");

  const MarkingType(this.wire);

  /// The exact string used in scenario JSON.
  final String wire;

  String toJson() => wire;

  static MarkingType fromJson(String v) => values.firstWhere(
        (e) => e.wire == v,
        orElse: () => throw FormatException('unknown MarkingType: $v'),
      );
}

/// TramAxis
enum TramAxis {
  ns("NS"),
  ew("EW");

  const TramAxis(this.wire);

  /// The exact string used in scenario JSON.
  final String wire;

  String toJson() => wire;

  static TramAxis fromJson(String v) => values.firstWhere(
        (e) => e.wire == v,
        orElse: () => throw FormatException('unknown TramAxis: $v'),
      );
}

/// TimeOfDay
enum TimeOfDay {
  day("day"),
  night("night"),
  dusk("dusk");

  const TimeOfDay(this.wire);

  /// The exact string used in scenario JSON.
  final String wire;

  String toJson() => wire;

  static TimeOfDay fromJson(String v) => values.firstWhere(
        (e) => e.wire == v,
        orElse: () => throw FormatException('unknown TimeOfDay: $v'),
      );
}

/// Weather
enum Weather {
  clear("clear"),
  rain("rain"),
  snow("snow"),
  fog("fog");

  const Weather(this.wire);

  /// The exact string used in scenario JSON.
  final String wire;

  String toJson() => wire;

  static Weather fromJson(String v) => values.firstWhere(
        (e) => e.wire == v,
        orElse: () => throw FormatException('unknown Weather: $v'),
      );
}

class Scenario {
  final String id;
  final int schemaVersion;
  final String questionId;
  final Scene scene;
  final List<Actor> actors;
  final Question question;
  final Resolution resolution;

  const Scenario({
    required this.id,
    required this.schemaVersion,
    required this.questionId,
    required this.scene,
    required this.actors,
    required this.question,
    required this.resolution,
  });

  static Scenario fromJson(Map<String, dynamic> j) => Scenario(
      id: j["id"] as String,
      schemaVersion: j["schema_version"] as int,
      questionId: j["question_id"] as String,
      scene: Scene.fromJson(j["scene"] as Map<String, dynamic>),
      actors: (j["actors"] as List<dynamic>).map((e) => Actor.fromJson(e as Map<String, dynamic>)).toList(growable: false),
      question: Question.fromJson(j["question"] as Map<String, dynamic>),
      resolution: Resolution.fromJson(j["resolution"] as Map<String, dynamic>),
    );

  Map<String, dynamic> toJson() => <String, dynamic>{
        "id": id,
        "schema_version": schemaVersion,
        "question_id": questionId,
        "scene": scene.toJson(),
        "actors": actors.map((e) => e.toJson()).toList(growable: false),
        "question": question.toJson(),
        "resolution": resolution.toJson(),
      };
}

/// Language-independent. No human-readable strings may appear here.
class Scene {
  final SceneType type;
  final List<Road> roads;
  final TramTrack? tramTrack;
  final List<Sign> signs;
  final List<Marking> markings;
  final List<TrafficLight> lights;
  final Conditions? conditions;

  const Scene({
    required this.type,
    required this.roads,
    this.tramTrack,
    this.signs = const [],
    this.markings = const [],
    this.lights = const [],
    this.conditions,
  });

  static Scene fromJson(Map<String, dynamic> j) => Scene(
      type: SceneType.fromJson(j["type"] as String),
      roads: (j["roads"] as List<dynamic>).map((e) => Road.fromJson(e as Map<String, dynamic>)).toList(growable: false),
      tramTrack: j["tram_track"] == null ? null : TramTrack.fromJson(j["tram_track"] as Map<String, dynamic>),
      signs: j["signs"] == null ? const [] : (j["signs"] as List<dynamic>).map((e) => Sign.fromJson(e as Map<String, dynamic>)).toList(growable: false),
      markings: j["markings"] == null ? const [] : (j["markings"] as List<dynamic>).map((e) => Marking.fromJson(e as Map<String, dynamic>)).toList(growable: false),
      lights: j["lights"] == null ? const [] : (j["lights"] as List<dynamic>).map((e) => TrafficLight.fromJson(e as Map<String, dynamic>)).toList(growable: false),
      conditions: j["conditions"] == null ? null : Conditions.fromJson(j["conditions"] as Map<String, dynamic>),
    );

  Map<String, dynamic> toJson() => <String, dynamic>{
        "type": type.toJson(),
        "roads": roads.map((e) => e.toJson()).toList(growable: false),
        if (tramTrack != null) "tram_track": tramTrack!.toJson(),
        "signs": signs.map((e) => e.toJson()).toList(growable: false),
        "markings": markings.map((e) => e.toJson()).toList(growable: false),
        "lights": lights.map((e) => e.toJson()).toList(growable: false),
        if (conditions != null) "conditions": conditions!.toJson(),
      };
}

class Road {
  final Dir dir;
  /// Lanes carrying traffic toward the intersection.
  final int lanesIn;
  /// Lanes carrying traffic away from the intersection.
  final int lanesOut;
  final Priority priority;

  const Road({
    required this.dir,
    required this.lanesIn,
    required this.lanesOut,
    required this.priority,
  });

  static Road fromJson(Map<String, dynamic> j) => Road(
      dir: Dir.fromJson(j["dir"] as String),
      lanesIn: j["lanes_in"] as int,
      lanesOut: j["lanes_out"] as int,
      priority: Priority.fromJson(j["priority"] as String),
    );

  Map<String, dynamic> toJson() => <String, dynamic>{
        "dir": dir.toJson(),
        "lanes_in": lanesIn,
        "lanes_out": lanesOut,
        "priority": priority.toJson(),
      };
}

class TramTrack {
  final TramAxis along;

  const TramTrack({
    required this.along,
  });

  static TramTrack fromJson(Map<String, dynamic> j) => TramTrack(
      along: TramAxis.fromJson(j["along"] as String),
    );

  Map<String, dynamic> toJson() => <String, dynamic>{
        "along": along.toJson(),
      };
}

class Sign {
  final Dir at;
  /// YHQ sign code, e.g. "2.4". A code, not prose.
  final String code;

  const Sign({
    required this.at,
    required this.code,
  });

  static Sign fromJson(Map<String, dynamic> j) => Sign(
      at: Dir.fromJson(j["at"] as String),
      code: j["code"] as String,
    );

  Map<String, dynamic> toJson() => <String, dynamic>{
        "at": at.toJson(),
        "code": code,
      };
}

class Marking {
  final MarkingType type;
  final Dir? at;

  const Marking({
    required this.type,
    this.at,
  });

  static Marking fromJson(Map<String, dynamic> j) => Marking(
      type: MarkingType.fromJson(j["type"] as String),
      at: j["at"] == null ? null : Dir.fromJson(j["at"] as String),
    );

  Map<String, dynamic> toJson() => <String, dynamic>{
        "type": type.toJson(),
        if (at != null) "at": at!.toJson(),
      };
}

class TrafficLight {
  final LightPlacement at;
  final LightState state;

  const TrafficLight({
    required this.at,
    required this.state,
  });

  static TrafficLight fromJson(Map<String, dynamic> j) => TrafficLight(
      at: LightPlacement.fromJson(j["at"] as String),
      state: LightState.fromJson(j["state"] as String),
    );

  Map<String, dynamic> toJson() => <String, dynamic>{
        "at": at.toJson(),
        "state": state.toJson(),
      };
}

class Conditions {
  final TimeOfDay time;
  final Weather weather;

  const Conditions({
    this.time = TimeOfDay.day,
    this.weather = Weather.clear,
  });

  static Conditions fromJson(Map<String, dynamic> j) => Conditions(
      time: j["time"] == null ? TimeOfDay.day : TimeOfDay.fromJson(j["time"] as String),
      weather: j["weather"] == null ? Weather.clear : Weather.fromJson(j["weather"] as String),
    );

  Map<String, dynamic> toJson() => <String, dynamic>{
        "time": time.toJson(),
        "weather": weather.toJson(),
      };
}

/// Language-independent. No human-readable strings may appear here.
class Actor {
  final String id;
  final ActorKind kind;
  final ActorRole role;
  final Dir from;
  final Dir to;
  /// Index of the incoming lane on the `from` road, 0 = nearest the centreline.
  final int laneIn;
  /// Index of the outgoing lane on the `to` road, 0 = nearest the centreline.
  final int laneOut;

  const Actor({
    required this.id,
    required this.kind,
    this.role = ActorRole.traffic,
    required this.from,
    required this.to,
    this.laneIn = 0,
    this.laneOut = 0,
  });

  static Actor fromJson(Map<String, dynamic> j) => Actor(
      id: j["id"] as String,
      kind: ActorKind.fromJson(j["kind"] as String),
      role: j["role"] == null ? ActorRole.traffic : ActorRole.fromJson(j["role"] as String),
      from: Dir.fromJson(j["from"] as String),
      to: Dir.fromJson(j["to"] as String),
      laneIn: j["lane_in"] == null ? 0 : j["lane_in"] as int,
      laneOut: j["lane_out"] == null ? 0 : j["lane_out"] as int,
    );

  Map<String, dynamic> toJson() => <String, dynamic>{
        "id": id,
        "kind": kind.toJson(),
        "role": role.toJson(),
        "from": from.toJson(),
        "to": to.toJson(),
        "lane_in": laneIn,
        "lane_out": laneOut,
      };
}

class Question {
  final Map<String, String> text;
  final List<Option> options;
  final String correct;

  const Question({
    required this.text,
    required this.options,
    required this.correct,
  });

  static Question fromJson(Map<String, dynamic> j) => Question(
      text: (j["text"] as Map<String, dynamic>).map((k, v) => MapEntry(k, v as String)),
      options: (j["options"] as List<dynamic>).map((e) => Option.fromJson(e as Map<String, dynamic>)).toList(growable: false),
      correct: j["correct"] as String,
    );

  Map<String, dynamic> toJson() => <String, dynamic>{
        "text": text,
        "options": options.map((e) => e.toJson()).toList(growable: false),
        "correct": correct,
      };
}

class Option {
  final String id;
  /// Actor id this option asserts should proceed first. Omitted for options that assert nobody proceeds.
  final String? refersTo;
  final Map<String, String> label;

  const Option({
    required this.id,
    this.refersTo,
    required this.label,
  });

  static Option fromJson(Map<String, dynamic> j) => Option(
      id: j["id"] as String,
      refersTo: j["refers_to"] == null ? null : j["refers_to"] as String,
      label: (j["label"] as Map<String, dynamic>).map((k, v) => MapEntry(k, v as String)),
    );

  Map<String, dynamic> toJson() => <String, dynamic>{
        "id": id,
        if (refersTo != null) "refers_to": refersTo!,
        "label": label,
      };
}

class Resolution {
  /// Sequence in which actors clear the conflict zone.
  final List<String> order;
  final Rule rule;
  /// Authoring hint for content review only. Never authoritative over simulation.
  final Map<String, Outcome> wrongOutcomes;

  const Resolution({
    required this.order,
    required this.rule,
    this.wrongOutcomes = const {},
  });

  static Resolution fromJson(Map<String, dynamic> j) => Resolution(
      order: (j["order"] as List<dynamic>).map((e) => e as String).toList(growable: false),
      rule: Rule.fromJson(j["rule"] as Map<String, dynamic>),
      wrongOutcomes: j["wrong_outcomes"] == null ? const {} : (j["wrong_outcomes"] as Map<String, dynamic>).map((k, v) => MapEntry(k, Outcome.fromJson(v as Map<String, dynamic>))),
    );

  Map<String, dynamic> toJson() => <String, dynamic>{
        "order": order,
        "rule": rule.toJson(),
        "wrong_outcomes": wrongOutcomes.map((k, v) => MapEntry(k, v.toJson())),
      };
}

class Rule {
  final String code;
  final Map<String, String> text;

  const Rule({
    required this.code,
    required this.text,
  });

  static Rule fromJson(Map<String, dynamic> j) => Rule(
      code: j["code"] as String,
      text: (j["text"] as Map<String, dynamic>).map((k, v) => MapEntry(k, v as String)),
    );

  Map<String, dynamic> toJson() => <String, dynamic>{
        "code": code,
        "text": text,
      };
}

class Outcome {
  final OutcomeType type;
  /// Actor id involved, where the outcome type implies a second party.
  final String? with_;

  const Outcome({
    required this.type,
    this.with_,
  });

  static Outcome fromJson(Map<String, dynamic> j) => Outcome(
      type: OutcomeType.fromJson(j["type"] as String),
      with_: j["with"] == null ? null : j["with"] as String,
    );

  Map<String, dynamic> toJson() => <String, dynamic>{
        "type": type.toJson(),
        if (with_ != null) "with": with_!,
      };
}

/// Locale code -> string. No locale is privileged; completeness is reported by tooling, not enforced here.
typedef LocalizedText = Map<String, String>;

