export enum IMAGE_EDITOR_ACTION {
  NONE = 0,
  CANCEL = 1,
  SUBMIT = 2,
  CROP = 3,
  GENERATE = 4,
  EDIT = 5,
  RESET = 6,
}

export enum REDUCER_ACTION {
  INIT,
  CHANGE_TYPE,
  FINISH_PROCESSING,
  RESET,
  CHANGE_SCALE,
  TOGGLE_FIX_BORDER,
  MOUSE_ZOOM,
}

export enum SCALE_VALUE {
  MIN = 0.1,
  MAX = 4,
  DEFAULT = 1,
}