export const PROJECT_CANVAS_GRID_SIZE_PX = 24;

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
