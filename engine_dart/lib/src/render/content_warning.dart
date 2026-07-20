/// Machine-readable content problems found while building a scene.
///
/// Principle: a scene that cannot be fully drawn must say so. Authors write
/// declarations; if the engine silently ignores one, the author sees a correct
/// preview of the wrong scene. These are data - the editor renders them next to
/// the field that caused them - never exceptions and never log lines.
enum WarningCode {
  /// A marking type the renderer has no artwork for yet.
  markingNotRendered,

  /// A marking that needs an `at` road but has none.
  markingMissingTarget,

  /// A marking, sign or light attached to a direction with no road.
  attachmentUnresolved,

  /// A sign code with no dedicated artwork; a generic shape was drawn.
  signArtworkGeneric,

  /// The scene type has no layout rule, so nothing meaningful was drawn.
  sceneTypeUnsupported,

  /// A road declares no lanes in a direction an actor needs.
  laneUnavailable,
}

class ContentWarning {
  final WarningCode code;

  /// JSON pointer-ish path to the offending declaration, e.g.
  /// `scene.markings[2]`. The editor uses this to focus the right field.
  final String path;

  /// Human-readable detail for the editor. Not shown to students, so this is
  /// the one place in the render pipeline where English prose is acceptable.
  final String detail;

  const ContentWarning(this.code, this.path, this.detail);

  Map<String, dynamic> toJson() => {
        'code': code.name,
        'path': path,
        'detail': detail,
      };

  @override
  String toString() => '[${code.name}] $path: $detail';
}
