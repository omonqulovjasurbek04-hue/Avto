import 'package:engine_dart/engine_dart.dart';
import 'package:test/test.dart';

void main() {
  group('screen-coordinate convention', () {
    test('N is -Y, S is +Y, E is +X, W is -X', () {
      expect(Dir.n.vector, const Vec2(0, -1));
      expect(Dir.s.vector, const Vec2(0, 1));
      expect(Dir.e.vector, const Vec2(1, 0));
      expect(Dir.w.vector, const Vec2(-1, 0));
    });

    test('right-hand side of a heading is (-y, x)', () {
      // Heading east (1,0) -> right is south (0,1), which is screen-down.
      expect(const Vec2(1, 0).perpRight, const Vec2(0, 1));
      // Heading north (0,-1) -> right is east (1,0).
      expect(const Vec2(0, -1).perpRight, const Vec2(1, 0));
    });

    test('opposites', () {
      expect(Dir.n.opposite, Dir.s);
      expect(Dir.e.opposite, Dir.w);
      expect(Dir.ne.opposite, Dir.sw);
    });
  });

  group('edgeDistance', () {
    test('cardinal roads reach the canvas edge at 500', () {
      for (final d in [Dir.n, Dir.s, Dir.e, Dir.w]) {
        expect(edgeDistance(d), 500);
      }
    });

    test('diagonal roads hit the edge at 500 * sqrt(2)', () {
      expect(edgeDistance(Dir.ne), closeTo(707.106, 0.01));
    });
  });

  group('orientedBox', () {
    test('axis-aligned box for an eastbound vehicle', () {
      final corners = orientedBox(const Vec2(500, 500), const Vec2(1, 0), 90, 44);
      expect(corners, const [
        Vec2(455, 478),
        Vec2(545, 478),
        Vec2(545, 522),
        Vec2(455, 522),
      ]);
    });
  });
}
