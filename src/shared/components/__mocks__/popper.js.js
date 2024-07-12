const PopperJS = jest.requireActual('popper.js');

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
