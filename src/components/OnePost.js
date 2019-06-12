import React from "react";
import axios from "axios";

import {Div, Footer,Panel, CellButton, View, Group, ScreenSpinner, PanelHeader} from "@vkontakte/vkui";
import Record from "../components/Record";
import {HEAD_HOST, HOST, STATISTOC_HOST, VK_APPS_URL} from '../constants/config'

import Cookies from "js-cookie";


export default class OnePost extends React.Component {
    constructor(props) {
        super(props);
        this.perent = props.main;
        this.state = {
            post_id: this.props.post_id,
            actPanel: "post",
            id: this.props.id,
            popout: null,
        };
        this.mainpage = this.mainpage.bind(this)
    }
    componentDidMount() {
        console.log("ONE POST");
    }

    componentWillMount() {
        this.setState({
            popout: <ScreenSpinner/>,
            // fetching: false
        });
        var main = this;
        axios.post(HEAD_HOST + '/one/', {
                post_id: this.state.post_id,
            }
        ).then((resp) => {
            main.setState({
                item: resp.data.post,
                fetching: false,
                popout: null
            });
        }).catch((e) => {
            console.log(e);
        })

    }

    mainpage() {
        if (Cookies.get("auth") == "ok")
            this.perent.setState({activeStory: "base"});
        else
            this.perent.setState({activeStory: "auth"});
        console.log(this.perent)
    }

    render() {
        var item = this.state.item;

        var main = this;

        return (<View popout={this.state.popout} id={this.state.id} activePanel={this.state.actPanel}>

            <Panel id="post">
                <PanelHeader>Terald</PanelHeader>

                <div>
                    {item ?
                    <Record
                        onepost={true}
                        parent={main}
                        record={item}/>
                        :
                        <Footer>Пост не найден</Footer>
                    }
                    {/*<Group>*/}
                    <CellButton expandable="true" align={"center"} onClick={this.mainpage}>Открыть Terald</CellButton>
                    {/*</Group>*/}
                </div>


            </Panel>
        </View>)
    }
}