/// Headless software rasteriser for golden-file tests and authoring previews.
///
/// Separate entrypoint because the app never needs it - Flutter replays the
/// same display list on a real canvas.
library;

export 'src/raster/raster.dart';
