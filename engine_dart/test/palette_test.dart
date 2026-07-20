import 'package:engine_dart/engine_dart.dart';
import 'package:test/test.dart';

int _luma(int argb) =>
    (((argb >> 16) & 0xFF) * 299 + ((argb >> 8) & 0xFF) * 587 + (argb & 0xFF) * 114) ~/ 1000;

void main() {
  group('mixColour', () {
    test('t = 0 and t = 1 are the endpoints', () {
      expect(mixColour(0xFF000000, 0xFFFFFFFF, 0), 0xFF000000);
      expect(mixColour(0xFF000000, 0xFFFFFFFF, 1), 0xFFFFFFFF);
    });

    test('midpoint blends each channel independently', () {
      expect(mixColour(0xFF000000, 0xFFFFFFFF, 0.5), 0xFF808080);
      expect(mixColour(0xFFFF0000, 0xFF0000FF, 0.5), 0xFF800080);
    });
  });

  group('forConditions', () {
    test('defaults to the daytime palette', () {
      expect(Palette.forConditions(null).ground, Palette.day.ground);
      expect(Palette.forConditions(const Conditions()).asphalt, Palette.day.asphalt);
    });

    test('night is darker than day across the board', () {
      expect(_luma(Palette.night.ground), lessThan(_luma(Palette.day.ground)));
      expect(_luma(Palette.night.asphalt), lessThan(_luma(Palette.day.asphalt)));
    });

    test('clear weather leaves the base palette untouched', () {
      final p = Palette.forConditions(
        const Conditions(time: TimeOfDay.night, weather: Weather.clear),
      );
      expect(p.asphalt, Palette.night.asphalt);
      expect(p.atmosphere, 0);
    });

    test('rain darkens the carriageway and adds a veil', () {
      final p = Palette.forConditions(const Conditions(weather: Weather.rain));
      expect(_luma(p.asphalt), lessThan(_luma(Palette.day.asphalt)));
      expect(p.atmosphere, isNot(0));
    });

    test('snow lightens the surroundings more than the carriageway', () {
      final p = Palette.forConditions(const Conditions(weather: Weather.snow));

      // Measured as distance travelled toward white, not absolute luma: the
      // ground already starts light, so an absolute comparison would say the
      // asphalt moved further while looking nothing like snow.
      double towardWhite(int before, int after) =>
          (_luma(after) - _luma(before)) / (255 - _luma(before));

      expect(
        towardWhite(Palette.day.ground, p.ground),
        greaterThan(towardWhite(Palette.day.asphalt, p.asphalt)),
      );
      // And the carriageway must stay legible against it.
      expect(_luma(p.ground), greaterThan(_luma(p.asphalt) + 40));
    });

    test('fog compresses contrast between ground and asphalt', () {
      final clearGap = (_luma(Palette.day.ground) - _luma(Palette.day.asphalt)).abs();
      final fog = Palette.forConditions(const Conditions(weather: Weather.fog));
      final fogGap = (_luma(fog.ground) - _luma(fog.asphalt)).abs();
      expect(fogGap, lessThan(clearGap));
    });

    test('weather composes with time of day rather than replacing it', () {
      final nightRain = Palette.forConditions(
        const Conditions(time: TimeOfDay.night, weather: Weather.rain),
      );
      final dayRain = Palette.forConditions(const Conditions(weather: Weather.rain));
      expect(_luma(nightRain.asphalt), lessThan(_luma(dayRain.asphalt)));
    });
  });

  test('atmosphere reaches the display list as an overlay', () {
    final base = _scenario(const Conditions(weather: Weather.fog));
    final ops = SceneBuilder(base).build().scene.ops;
    expect(ops.where((o) => o.layer == Layer.overlays), hasLength(1));

    final clear = _scenario(const Conditions());
    expect(SceneBuilder(clear).build().scene.ops.where((o) => o.layer == Layer.overlays), isEmpty);
  });
}

Scenario _scenario(Conditions conditions) => Scenario(
      id: 'sc-9999',
      schemaVersion: 1,
      questionId: 'q-9999',
      topic: Topic.priorityAndIntersections,
      scene: Scene(
        type: SceneType.crossroads4way,
        roads: const [
          Road(dir: Dir.n, lanesIn: 1, lanesOut: 1, priority: Priority.equal),
          Road(dir: Dir.s, lanesIn: 1, lanesOut: 1, priority: Priority.equal),
          Road(dir: Dir.e, lanesIn: 1, lanesOut: 1, priority: Priority.equal),
          Road(dir: Dir.w, lanesIn: 1, lanesOut: 1, priority: Priority.equal),
        ],
        conditions: conditions,
      ),
      actors: const [Actor(id: 'ego', kind: ActorKind.car, from: Dir.s, to: Dir.n)],
      question: const Question(
        text: {'en': 'x'},
        options: [
          Option(id: 'o1', label: {'en': 'a'}),
          Option(id: 'o2', label: {'en': 'b'}),
        ],
        correct: 'o1',
      ),
      resolution: const Resolution(
        order: ['ego'],
        rule: Rule(code: '13.9', text: {'en': 'x'}),
      ),
    );
