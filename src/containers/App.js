import React from 'react';
import connect from '@vkontakte/vkui-connect';
import { View } from '@vkontakte/vkui';
import '@vkontakte/vkui/dist/vkui.css';


function createStore(reducer, initialState) {
    var currentReducer = reducer;
    var currentState = initialState;
    var listener = () => {};
    return {
        getState() {
            return currentState;
        },
        dispatch(action) {
            currentState = currentReducer(currentState, action);
            listener(); // Заметьте, что мы добавили эту строку!
            return action;
        },
        subscribe(newListener) {
            listener = newListener;
        }
    };
}

// class App extends React.Component {
// 	constructor(props) {
// 		super(props);
//
// 		this.state = {
// 			activePanel: 'home',
// 			fetchedUser: null,
// 		};
// 	}
//
// 	componentDidMount() {
// 		connect.subscribe((e) => {
// 			switch (e.detail.type) {
// 				case 'VKWebAppGetUserInfoResult':
// 					this.setState({ fetchedUser: e.detail.data });
// 					break;
// 				default:
// 					console.log(e.detail.type);
// 			}
// 		});
// 		connect.send('VKWebAppGetUserInfo', {});
// 	}
//
// 	go = (e) => {
// 		this.setState({ activePanel: e.currentTarget.dataset.to })
// 	};
//
// 	render() {
// 		return (
// 			<View activePanel={this.state.activePanel}>
// 				<Home id="home" fetchedUser={this.state.fetchedUser} go={this.go} />
// 				<Persik id="persik" go={this.go} />
// 			</View>
// 		);
// 	}
// }

class App extends React.Component {

	constructor() {
		super();
		this.state = {
			description: '<div>Test<div/>'
		};
	}

	render() {
		return (
			<div dangerouslySetInnerHTML={{ __html: (this.state.description) }} />
		);
	}
}

export default App;
