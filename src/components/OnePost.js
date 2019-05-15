import React from "react";
import axios from "axios";

import {Div, Panel,CellButton, View,Group,ScreenSpinner,PanelHeader} from "@vkontakte/vkui";
import Record from "../components/Record";
import {HEAD_HOST, HOST, STATISTOC_HOST, VK_APPS_URL} from '../constants/config'

import Cookies from "js-cookie";


export default class OnePost extends React.Component {
    constructor(props) {
        super(props);
        this.state={
            post_id:this.props.post_id,
            actPanel:"post",
            id:this.props.id,
            popout:null,
            item:{}
        };
    }
    componentWillMount() {
        this.setState({
            popout: <ScreenSpinner />,
            // fetching: false
        });
        var main = this;
        axios.post(HEAD_HOST + '/one/', {
                    post_id:this.state.post_id,
                }
        ).then((resp)=>{
            main.setState({
                item:resp.data.post,
                fetching: false,
                popout: null});
        }).catch((e)=>{
            console.log(e);
        })

    }
    mainpage(){
            window.location.replace(VK_APPS_URL);
    }

    render() {
        var item = this.state.item;
        var main = this;
        console.log("POST",item);
        return (<View popout={this.state.popout} id={this.state.id} activePanel={this.state.actPanel}>

            <Panel  id="post">
                <PanelHeader>Terald</PanelHeader>

                {item['text'] &&
                <Record
                    onepost={true}
                    parents={main}
                    entities={item['entities']}
                    text={item['text']}
                    gname={item['group_title']}
                    title={item['title']}
                    imgs={item['images']}
                    gava={item['gava']}
                    pusturl={item['pusturl']}
                    article={item['article']}
                    time={item['time']}
                    postid={item['post_id']}/>
                }
                {/*<Group>*/}
                    <CellButton expandable={true} align={"center"} onClick={this.mainpage}>Открыть Terald</CellButton>
                {/*</Group>*/}

            </Panel>
        </View>)
    }
}