import 'core-js/es6/map';
import 'core-js/es6/set';
import React from 'react';
import ReactDOM from 'react-dom';

import { Provider } from 'react-redux';
import {WrappedAppT} from './containers'
import store from './reducers/store'
import registerServiceWorker from './sw';

import connect from '@vkontakte/vkui-connect-promise';
connect.send('VKWebAppInit', {});

// Если вы хотите, чтобы ваше веб-приложение работало в оффлайне и загружалось быстрее,
// расскомментируйте строку с registerServiceWorker();
// Но не забывайте, что на данный момент у технологии есть достаточно подводных камней
// Подробнее про сервис воркеры можно почитать тут — https://vk.cc/8MHpmT 
// registerServiceWorker();
/*eslint-disable */



// optional cofiguration

const Root = () => (
        <Provider store={store}>
                <WrappedAppT/>
        </Provider>
);


ReactDOM.render(<Root />, document.getElementById('root'));
