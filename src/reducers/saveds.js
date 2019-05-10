import * as types from '../constants/ActionTypes';
import omit from 'object.omit';
import * as offline from '../constants/offline'

export  default function saveds(state = {y:0,menu:[],history:0}, action) {
  switch (action.type) {
    case 'SAVEDS_UPDATE':
      return action.data;
    case 'SET_SAVED_Y':
      state.y=action.data;
      return state;
    case 'SET_SAVED_MENU':
      state.menu=action.data;
      return state;
    case 'HISTORY':
      state.history=action.data;
      return state;
    default:
      return state
  }
}