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

  group('segmentsIntersect', () {
    test('a clean crossing', () {
      expect(
          segmentsIntersect(
            const Vec2(0, 0), const Vec2(10, 10), //
            const Vec2(0, 10), const Vec2(10, 0),
          ),
          isTrue);
    });

    test('parallel segments never meet', () {
      expect(
          segmentsIntersect(
            const Vec2(0, 0), const Vec2(10, 0), //
            const Vec2(0, 5), const Vec2(10, 5),
          ),
          isFalse);
    });

    test('segments that would cross if extended do not count', () {
      expect(
          segmentsIntersect(
            const Vec2(0, 0), const Vec2(1, 1), //
            const Vec2(5, 0), const Vec2(6, -1),
          ),
          isFalse);
    });

    test('a shared endpoint counts as touching', () {
      expect(
          segmentsIntersect(
            const Vec2(0, 0), const Vec2(10, 0), //
            const Vec2(10, 0), const Vec2(10, 10),
          ),
          isTrue);
    });

    test('collinear overlap counts', () {
      expect(
          segmentsIntersect(
            const Vec2(0, 0), const Vec2(10, 0), //
            const Vec2(5, 0), const Vec2(15, 0),
          ),
          isTrue);
    });
  });

  group('segmentIntersectionPoint', () {
    test('returns the crossing point', () {
      final p = segmentIntersectionPoint(
        const Vec2(0, 0), const Vec2(10, 10), //
        const Vec2(0, 10), const Vec2(10, 0),
      );
      expect(p, isNotNull);
      expect(p!.x, closeTo(5, 1e-9));
      expect(p.y, closeTo(5, 1e-9));
    });

    test('null when parallel', () {
      expect(
        segmentIntersectionPoint(
          const Vec2(0, 0), const Vec2(10, 0), //
          const Vec2(0, 5), const Vec2(10, 5),
        ),
        isNull,
      );
    });

    test('null when the crossing lies beyond the segments', () {
      expect(
        segmentIntersectionPoint(
          const Vec2(0, 0), const Vec2(1, 1), //
          const Vec2(5, 0), const Vec2(6, -1),
        ),
        isNull,
      );
    });
  });

  group('obbOverlap', () {
    List<Vec2> box(Vec2 c, Vec2 heading, double l, double w) => orientedBox(c, heading, l, w);

    test('two boxes on the same spot overlap', () {
      final a = box(const Vec2(500, 500), const Vec2(1, 0), 90, 44);
      final b = box(const Vec2(510, 500), const Vec2(0, 1), 90, 44);
      expect(obbOverlap(a, b), isTrue);
    });

    test('boxes far apart do not overlap', () {
      final a = box(const Vec2(100, 100), const Vec2(1, 0), 90, 44);
      final b = box(const Vec2(800, 800), const Vec2(1, 0), 90, 44);
      expect(obbOverlap(a, b), isFalse);
    });

    test('rotation matters: a diagonal box clips a neighbour an AABB would miss', () {
      // Centres 60 apart on X. As axis-aligned 90x44 boxes (half-length 45)
      // they would overlap; rotate one 45 degrees and the corner geometry
      // decides. This is why the narrow phase is OBB, not bounding-box.
      final a = box(const Vec2(500, 500), const Vec2(1, 0), 90, 44);
      final diagonal = box(const Vec2(560, 500), const Vec2(1, 1), 90, 44);
      expect(obbOverlap(a, diagonal), isTrue);
    });

    test('bumper to bumper is not a crash', () {
      // Two eastbound boxes exactly one length apart: touching, gap zero.
      final a = box(const Vec2(500, 500), const Vec2(1, 0), 90, 44);
      final b = box(const Vec2(590, 500), const Vec2(1, 0), 90, 44);
      expect(obbOverlap(a, b), isFalse);
    });
  });
}
