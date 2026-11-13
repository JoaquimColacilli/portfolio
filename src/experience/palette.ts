/** Cyanotype paper, white ink, one amber signal. Kept in step with src/styles/base.css. */
export const palette = {
  paper: '#0f2c7e',
  paperDeep: '#04091f',
  paperLight: '#2a5bd0',
  ink: '#eef3ff',
  inkDim: '#9fb4e8',
  signal: '#ffc043',
  /** the same paper after dark */
  night: {
    paper: '#071136',
    paperDeep: '#010206',
    paperLight: '#1b3690',
  },
  /** lamp colours: obstruction and port lights, starboard and threshold lights, taxiway lights */
  red: '#ff4a3d',
  green: '#3bffa0',
  ice: '#86b8ff',
} as const;
