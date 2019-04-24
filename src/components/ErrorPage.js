import React from 'react';
import {View,Alert,Div,Avatar,Tooltip,List,Textarea,Cell,Switch,Group,CellButton,HeaderButton,InfoRow,ScreenSpinner,Checkbox,Select,Radio, FormLayout, FormLayoutGroup,Link, FormStatus, Input, Panel, PanelHeader,Button,Spinner} from "@vkontakte/vkui";

import 'react-toastify/dist/ReactToastify.css';


export default class ErrorPage extends React.Component {
    constructor(props) {
        super(props);
        this.state={
            id:this.props.id,
            actPanel:"errorpage"
        };
    }



    render() {
        var main = this;
        return (<View  id={this.state.id} activePanel={this.state.actPanel}>
            <Panel id="errorpage">
                {/*<ToastContainer autoClose={2000} />*/}
                {/*<PanelHeader>Setting</PanelHeader>*/}
                <Div><img className={"ephoto"} src={"https://pbs.twimg.com/media/DpnozJyXcAAIB0G.jpg"}></img></Div>
                <Div className={"etext"}>На сервере ведутся технические работы.</Div>
                <Div className={"etext2"} > Не волнуйтесь, наша обкаченная кофеином команда разработчиков скоро все починит.</Div>

            </Panel>
        </View>)
    }
}