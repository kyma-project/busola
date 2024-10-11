const PopperJS = await vi.importActual('popper.js');

/* eslint-disable import/no-anonymous-default-export */
export default class {
  static placements = PopperJS.placements;

  constructor() {
    return {
      destroy: () => {},
      scheduleUpdate: () => {},
    };
  }
}
