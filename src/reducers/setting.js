

export  default function setting(state = {y:0}, action) {
  switch (action.type) {

    case 'SET_SETTING_Y':
      state.y=action.data;
      return state;
    case 'CLEAR':
      state = {y:0};
      return state;
    default:
      return state
  }
}