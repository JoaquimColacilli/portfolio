import { Vector3 } from 'three/webgpu';

/** Height of the drafting floor. */
export const FLOOR_Y = -2.6;

/**
 * Where each sheet's drawing stands in the world. The visitor travels down −Z, from the
 * cover (0) through five chapters on the ground, then climbs to the last three sheets.
 */
export const ANCHORS: Vector3[] = [
  new Vector3(0, 0, 0), //        0 · cover
  new Vector3(2.2, 0.0, -18), //  1 · technical school
  new Vector3(-2.4, 0.3, -36), // 2 · freelance + university
  new Vector3(2.4, 0.6, -54), //  3 · NTT Data
  new Vector3(-2.2, 0.2, -72), // 4 · Almundo
  new Vector3(2.0, 0.4, -90), //  5 · Despegar
  new Vector3(0, 15, -116), //    6 · work
  new Vector3(0, 19, -134), //    7 · toolkit
  new Vector3(0, 22, -152), //    8 · contact
];

export const SHEET_COUNT = ANCHORS.length;
export const FIRST_CHAPTER = 1;
export const LAST_CHAPTER = 5;

/** Point of the line under a chapter's drawing, relative to its anchor: low and to the left, clear of the title block. */
export const RAIL_OFFSET = new Vector3(-1.3, -2.15, 0.9);

/** Size every chapter drawing is composed for (local units). */
export const DRAWING_WIDTH = 4.7;
export const DRAWING_HEIGHT = 3.5;
