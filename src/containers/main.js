import React from 'react';
import ReactDOM from 'react-dom';
import {
    View,
    Panel,
    PanelHeader,
    Tooltip,
    Avatar,
    Group,
    List,
    Cell,
    CellButton,
    HeaderButton,
    TabbarItem,
    Tabbar,
    Epic,
    Div,
    Button,
    FormLayout,
    Input,
    FormLayoutGroup,
    FormStatus
} from '@vkontakte/vkui';
import '@vkontakte/vkui/dist/vkui.css';
import Icon28Saved from '@vkontakte/icons/dist/28/attach_outline';
import Icon28Setting from '@vkontakte/icons/dist/28/settings';
import Icon28Newsfeed from '@vkontakte/icons/dist/28/newsfeed';
import Icon28Widgets from '@vkontakte/icons/dist/28/keyboard_bots_outline';

import '../css/record.css'
import '../css/widget-frame.css'
import '../css/article.css'
import '../css/css.css'

import {connect, Provider} from 'react-redux';

import AuthForm from '../components/AuthForm'
import Setting from '../components/Setting'
import {WidgetRecordList,RecordList,RecordSavedList} from '../containers'

import Cookies from "js-cookie";
import { Provider as AlertProvider } from 'react-alert'
import AlertTemplate from 'react-alert-template-basic'
import {CONSTANT_USER, GUEST_HESH, SERVER_ERROR, VERSION} from "../constants/config";
import ErrorPage from "../components/ErrorPage";
import OnePost from "../components/OnePost";


class AppT extends React.Component {
    constructor(props) {

        super(props);
        this.store = this.props.store;
        // console.log("STORE",this.store);
        this.dispatch = this.props.dispatch;

        this.state = {
            activePanel: 'main',
            activeStory:"base",
            premium:false,
            error_page:SERVER_ERROR
        };
        this.onStoryChange = this.onStoryChange.bind(this);
        this.changePanel = this.changePanel.bind(this);

        var params = window.location.hash ;
        params = "{\"" +
            params
                .replace( /\#/gi, "" )
                .replace( /\&/gi, "\",\"" )
                .replace( /\=/gi, "\":\"" ) +
            "\"}";
        try {
            this.params = JSON.parse(params);
        }
        catch (e) {
            this.params ={};
        }

        console.log("user_id: ", this.params)


    }
    componentWillMount() {
        if(CONSTANT_USER){
            Cookies.set("hash", GUEST_HESH);
            Cookies.set("auth", "ok");
        }

    }



    componentDidMount() {
        // localStorage.clear();

        //---------------INIT----------------------
        try {
            this.setting = JSON.parse(Cookies.get("Setting"));
        }
        catch (e) {
            this.setting={}
        }
        if(this.setting.btheme){
            document.body.setAttribute("scheme","client_dark");
        }
        var v =Cookies.get("version");
        if(v!=VERSION){
            Cookies.set("version",VERSION);
            localStorage.setItem("savedR","");
            localStorage.setItem("listsavedR","");
        }
        // if(this.setting['ui']==="tg"){
        //     this.setState({activeStory:"wigetsrecord"})
        // }
        try {
            // setTimeout(this.spesialproposal, 8000);
        }
        catch (e) {

        }
        //--------------INIT--------------------
    }

    spesialproposal(){
        if(Cookies.get("Proposal")==null)
            return;
        var proposal ={};
        if(Cookies.get("Proposal"))
            proposal = JSON.parse(Cookies.get("Proposal"));

        var setting = JSON.parse(Cookies.get("Setting"));
        console.log("setting",setting);
        if(setting && setting.btheme){
            document.body.setAttribute("scheme","client_dark");
        }
        if(setting.timeinapp > 1100 && !proposal.addtofav){
            connect.send("VKWebAppAddToFavorites", {});
            proposal.addtofav = true;
        }
        else if(setting.timeinapp > 700 && !proposal.notification){
            connect.send("VKWebAppAllowNotifications", {})
                .then((resp)=>{
                    if(resp["type"]=="VKWebAppAllowNotificationsResult" && resp["data"]["result"]){
                        setting.notification = true;
                        proposal.notification = true;
                    }
                })

        }
        Cookies.set("Proposal",proposal);
        Cookies.set("Setting",setting);
    }

    onStoryChange(e) {
        if(this.state.activeStory===e.currentTarget.dataset.story){
            if(this.scroll){
                return;
            }

            var main = this;
            this.scroll = true;
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
            var posTop = (window.pageYOffset !== undefined) ? window.pageYOffset : (document.documentElement ).scrollTop;
            if(posTop>6000)
            setTimeout(()=>{
                window.scrollTo(0,0);
                main.scroll=false;

            },600)
        }
        else
        this.setState({activeStory: e.currentTarget.dataset.story})
    }

    changePanel(p) {
        this.setState({activePanel: p})
    }

    render() {
        var tabbar = (
            <Tabbar>
                <TabbarItem
                    onClick={this.onStoryChange}
                    selected={this.state.activeStory === 'saved'}
                    data-story="saved"
                ><Icon28Saved/></TabbarItem>

                <TabbarItem
                    onClick={this.onStoryChange}
                    selected={this.state.activeStory === 'base'}
                    data-story="base"
                ><Icon28Newsfeed/></TabbarItem>

                {false &&
                <Tooltip >
                    <TabbarItem
                        onClick={this.onStoryChange}
                        selected={this.state.activeStory === 'wigetsrecord'}
                        data-story="wigetsrecord"
                        label="B"
                    ><Icon28Widgets/></TabbarItem>
                </Tooltip>}

                <TabbarItem
                    onClick={this.onStoryChange}
                    selected={this.state.activeStory === 'setting'}
                    data-story="setting"
                    label=""
                ><Icon28Setting/></TabbarItem>
            </Tabbar>
        );
        if(Cookies.get('auth')!='ok') {
            tabbar = null;
            this.state.activeStory = 'auth';
        }
        else {
            Cookies.set("codewait", false);
        }
        if(this.params.post ){
            this.state.activeStory = "onepost";
            tabbar=null;
        }
        if(this.state.error_page){
            this.state.activeStory = 'epage';
            tabbar=null;
        }

        return (
            <Epic activeStory={this.state.activeStory} tabbar={tabbar}>
                <Setting id={"setting"} store={this.store.setting} dispatch={this.dispatch} main={this}/>
                <RecordList store={this.store.record} dispatch={this.dispatch} id={"base"}/>
                <RecordSavedList store={this.store.saveds} dispatch={this.dispatch}  id={"saved"}/>
                {false &&
                <WidgetRecordList store={this.store.wrecord} dispatch={this.dispatch} id={"wigetsrecord"}/>}
                <AuthForm id={"auth"}/>
                <OnePost post_id={this.params.post} id={"onepost"}/>
                <ErrorPage id={"epage"}/>
            </Epic>
        );
    }
}


const mapStateToProps =(state)=> {
    return {
        store:state
    };
};
const WrappedAppT = connect(mapStateToProps)(AppT);
export default WrappedAppT

