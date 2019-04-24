import * as reducers from './index';
import { createStore, combineReducers } from 'redux';

const reducer = combineReducers(reducers);
const store = createStore(reducer);

store.subscribe(() => {
        // console.log(store.getState());
    }
);
export default store;
