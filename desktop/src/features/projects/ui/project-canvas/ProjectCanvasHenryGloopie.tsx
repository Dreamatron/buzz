import { ProjectCanvasStackedAlphaGloopie } from "./ProjectCanvasStackedAlphaGloopie";

const HENRY_GLOOPIE_SRC = "/project-canvas/henry-hoover-gloopie.mp4";

export function ProjectCanvasHenryGloopie() {
  return (
    <ProjectCanvasStackedAlphaGloopie
      ariaLabel="Henry Hoover Gloopie"
      sourceTestId="project-canvas-henry-gloopie-source"
      src={HENRY_GLOOPIE_SRC}
      testId="project-canvas-henry-gloopie"
    />
  );
}
