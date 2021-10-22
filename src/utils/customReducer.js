export function themeReducer(previousState = "light", { type, payload }) {
  if (type === "CHANGE_THEME") {
    return payload;
  }
  return previousState;
}

export function langReducer(previousState = "en", { type, payload }) {
  if (type === "CHANGE_LANGUAGE") {
    return payload;
  }
  return previousState;
}

export function settingAllReducer(previousState = {}, { type, payload }) {
  if (type === "UPDATE_SETTING") {
    return payload;
  }
  return previousState;
}
