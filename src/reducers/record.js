import * as types from '../constants/ActionTypes';
import omit from 'object.omit';
import * as offline from '../constants/offline'

export  default function record(state = {list:[],full_list:[],fullphoto:{},actPanel:"main"}, action) {

  switch (action.type) {
    case "RECORDS_UPDATE":
      state.list =  action.data;
      return state;
    case 'SET_MAIN_Y':
      state.y=action.data;
      return state;
    case 'UPDATE_RECORD_LIST':
      state.full_list=action.data;
      return state;
    case 'SET_RECORD_LIST':
      state.actPanel = "main";
      return state;
    default:
      return state
  }
}
