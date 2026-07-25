import 'package:engine_dart/engine_dart.dart';
import 'package:test/test.dart';

Scene scene4way({int ewLanes = 1, List<Marking> markings = const []}) => Scene(
      type: SceneType.crossroads4way,
      roads: [
        const Road(dir: Dir.n, lanesIn: 1, lanesOut: 1, priority: Priority.equal),
        const Road(dir: Dir.s, lanesIn: 1, lanesOut: 1, priority: Priority.equal),
        Road(dir: Dir.e, lanesIn: ewLanes, lanesOut: ewLanes, priority: Priority.equal),
        Road(dir: Dir.w, lanesIn: ewLanes, lanesOut: ewLanes, priority: Priority.equal),
      ],
      markings: markings,
    );

void main() {
  group('RoadLayout', () {
    test('half-width follows the spec formula', () {
      final rl = RoadLayout(
        const Road(dir: Dir.e, lanesIn: 2, lanesOut: 2, priority: Priority.main),
      );
      expect(rl.halfWidth, (2 + 2) * kLaneWidth / 2);
    });

    test('asymmetric roads still fit every lane', () {
      final rl = RoadLayout(
        const Road(dir: Dir.e, lanesIn: 3, lanesOut: 1, priority: Priority.main),
      );
      // Spec formula would give 120, but 3 incoming lanes need 180 on one side.
      expect(rl.halfWidth, 3 * kLaneWidth);
    });

    test('incoming lanes sit right of the centreline for arriving traffic', () {
      // Southbound arrival from N: heading (0,1), right-hand side is -X (west).
      final rl = RoadLayout(
        const Road(dir: Dir.n, lanesIn: 1, lanesOut: 1, priority: Priority.equal),
      );
      final p = rl.incomingPoint(0, 100);
      expect(p.x, lessThan(kCentre.x));
      expect(p.y, kCentre.y - 100);
      // And the outgoing lane mirrors it.
      expect(rl.outgoingPoint(0, 100).x, greaterThan(kCentre.x));
    });

    test('lane offset magnitude is (i + 0.5) * LANE_WIDTH', () {
      final rl = RoadLayout(
        const Road(dir: Dir.s, lanesIn: 2, lanesOut: 2, priority: Priority.equal),
      );
      expect(rl.incomingOffset(0).length, 0.5 * kLaneWidth);
      expect(rl.incomingOffset(1).length, 1.5 * kLaneWidth);
    });
  });

  group('IntersectionLayout', () {
    test('box extents come from the crossing roads', () {
      final layout = IntersectionLayout(scene4way(ewLanes: 2));
      // N/S roads are 1+1 lanes -> halfX 60. E/W are 2+2 -> halfY 120.
      expect(layout.box.width / 2, 60);
      expect(layout.box.height / 2, 120);
    });

    test('t_junction with no E/W arm still gets a box', () {
      final layout = IntersectionLayout(Scene(
        type: SceneType.tJunction,
        roads: const [
          Road(dir: Dir.n, lanesIn: 1, lanesOut: 1, priority: Priority.main),
          Road(dir: Dir.s, lanesIn: 1, lanesOut: 1, priority: Priority.main),
          Road(dir: Dir.w, lanesIn: 1, lanesOut: 1, priority: Priority.secondary),
        ],
      ));
      expect(layout.box.width, greaterThan(0));
      expect(layout.box.height, greaterThan(0));
    });

    test('crosswalk pushes the stop distance back', () {
      final without = IntersectionLayout(scene4way());
      final with_ = IntersectionLayout(scene4way(
        markings: const [Marking(type: MarkingType.crosswalk, at: Dir.s)],
      ));
      expect(
        with_.stopDistance(Dir.s),
        without.stopDistance(Dir.s) + kCrosswalkGap + kCrosswalkDepth,
      );
      // Other arms are unaffected.
      expect(with_.stopDistance(Dir.n), without.stopDistance(Dir.n));
    });
  });

  group('stagedPose', () {
    test('vehicle rests behind the stop line, nose toward the centre', () {
      final layout = IntersectionLayout(scene4way());
      const actor = Actor(id: 'ego', kind: ActorKind.car, from: Dir.s, to: Dir.n);
      final pose = stagedPose(layout, actor);

      expect(pose.heading, Dir.s.vector * -1); // arriving from S, heading north
      final noseY = pose.position.y - pose.size.length / 2;
      expect(noseY - kCentre.y, layout.stopDistance(Dir.s) + kRestGap);
    });

    test('tram uses tram dimensions', () {
      final layout = IntersectionLayout(scene4way(ewLanes: 2));
      const tram = Actor(id: 't', kind: ActorKind.tram, from: Dir.e, to: Dir.w);
      expect(stagedPose(layout, tram).size.length, kTramLength);
    });
  });
}
