import * as offline from '../constants/offline'

export  default function wrecord(state = [], action) {
    switch (action.type) {
        case 'WIDGETS_UPDATE':
            state.list=action.data;
            return state;
        default:
            return state
    }
}