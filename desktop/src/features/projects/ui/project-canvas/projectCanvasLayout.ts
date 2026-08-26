export const PROJECT_CANVAS_GRID_SIZE_PX = 24;
export const PROJECT_CANVAS_DEFAULT_DRAWER_RATIO = 1 / 3;
export const PROJECT_CANVAS_MIN_DRAWER_HEIGHT_PX = 96;
export const PROJECT_CANVAS_MIN_LOWER_PANE_HEIGHT_PX = 280;
export const PROJECT_CANVAS_MAX_DRAWER_RATIO = 0.72;

export type ProjectCanvasPoint = {
  x: number;
  y: number;
};

export const PROJECT_CANVAS_HOME_TRANSLATION: ProjectCanvasPoint = {
  x: 24,
  y: 24,
};

export function snapProjectCanvasPoint(
  point: ProjectCanvasPoint,
): ProjectCanvasPoint {
  return {
    x:
      Math.round(point.x / PROJECT_CANVAS_GRID_SIZE_PX) *
      PROJECT_CANVAS_GRID_SIZE_PX,
    y:
      Math.round(point.y / PROJECT_CANVAS_GRID_SIZE_PX) *
      PROJECT_CANVAS_GRID_SIZE_PX,
  };
}

export function clampProjectCanvasDrawerRatio(
  ratio: number,
  containerHeight: number,
): number {
  if (!Number.isFinite(ratio) || containerHeight <= 0) {
    return PROJECT_CANVAS_DEFAULT_DRAWER_RATIO;
  }

  const { maximum, minimum } = projectCanvasDrawerRatioBounds(containerHeight);
  return Math.min(maximum, Math.max(minimum, ratio));
}

export function projectCanvasDrawerRatioBounds(containerHeight: number): {
  maximum: number;
  minimum: number;
} {
  if (containerHeight <= 0) {
    return {
      maximum: PROJECT_CANVAS_DEFAULT_DRAWER_RATIO,
      minimum: PROJECT_CANVAS_DEFAULT_DRAWER_RATIO,
    };
  }

  const minimumRatio = Math.min(
    PROJECT_CANVAS_DEFAULT_DRAWER_RATIO,
    PROJECT_CANVAS_MIN_DRAWER_HEIGHT_PX / containerHeight,
  );
  const maximumRatio = Math.max(
    minimumRatio,
    Math.min(
      PROJECT_CANVAS_MAX_DRAWER_RATIO,
      1 - PROJECT_CANVAS_MIN_LOWER_PANE_HEIGHT_PX / containerHeight,
    ),
  );
  return { maximum: maximumRatio, minimum: minimumRatio };
}
