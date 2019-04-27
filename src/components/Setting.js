import React from 'react';
import {View,Alert,Footer,Div,Search,Avatar,Tooltip,List,Textarea,Cell,Switch,Group,CellButton,HeaderButton,InfoRow,ScreenSpinner,Checkbox,Select,Radio, FormLayout, FormLayoutGroup,Link, FormStatus, Input, Panel, PanelHeader,Button,Spinner} from "@vkontakte/vkui";

import Cookies from "js-cookie";
import Icon24About from '@vkontakte/icons/dist/24/info'
import {
    SETTING_GET_PREMIUM_TEXT,
    TOOLTIP_PERSONAL_DATA,
    TOOLTIP_PREMUIM,
    SETTING_GET_PREMIUM_TITLE,
    ABOUT_AUTHOR,

    SETTING_GET_PREMIUM_POST,
    ALERT_LOG_OUT,
    ALERT_REBULD_ACCOUNT,
    SETTING_HEAD,
    SETTING_FMAIL_MEN,
    SETTING_FMAIL_WOMEN,
    SETTING_SHOWSE_POL,
    SETTING_PLASEHODER_NOT_FOUND,
    SETTING_a17,
    SETTING_a90,
    SETTING_a60,
    SETTING_a45,
    SETTING_a35,
    SETTING_a25,
    SETTING_HASHTEGS,
    SETTING_HASHTEGS_TOP,
    SETTING_HASHTEGS_PLASEHODER,
    SETTING_PREMIUM_FUNCTIONAL,
    SETTING_PREMIUM_GET_VIEW_STAT,
    SETTING_PREMIUM_ON_ADBLOCK,
    SETTING_PREMIUM_ON_BLACK_THEME,
    SETTING_PREMIUM_ON_AD_POSTS,
    SETTING_PREMIUM_ON_HIED_AD_POSTS,
    SETTING_PREMIUM_GET_PRIMIUM,
    SETTING_UPLOAD_GROUP_LIST,
    SETTING_DELETE_ACCOUNT,
    SETTING_LOGOUT,
    SETTING_INFO_TITLE,
    SETTING_CHANGE_GROUP_LIST,
    SETTING_INFO_DEBAG_TOP,
    SETTING_INFO_DEBAG_BUTTON,
    SETTING_INFO_DEBAG_TITLE,
    SETTING_ABOUT_AUTOR,
    SETTING_YOUR_ARE_GUEST,
    SETTING_YOUR_ARE_GUEST_TEXT,
    SETTING_YOUR_ARE_GUEST_ENTER,
    SETTING_GROUP_SETTING,
    SETTING_EDIT_GROUP_LIST,
    SETTING_ADD_NEW_GROUP,
    SETTING_UPDATE_PRIFIL,
    SETTING_NOTHING_NOT_FOUND,
    SETTING_FIND_GROUP,
    SETTING_FIND_GROUP_TITLE, SETTING_UPDATE_CANCLE
} from "../constants/TextConstants";
import axios from "axios";
import {STATISTOC_HOST,HOST,VERSION,GUEST_HESH} from "../constants/config";
import Icon24Back from '@vkontakte/icons/dist/24/back';
import connect from '@vkontakte/vkui-connect';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "../css/setting.css"
import { platform, IOS, ANDROID } from '@vkontakte/vkui';

import Icon24Flash from "@vkontakte/icons/dist/24/flash";

export default class Setting extends React.Component {
    constructor(props) {
        super(props);
        this.dbRef = React.createRef();

        this.state={
            actPanel:"set",
            id:props.id,
            tooltip:false,
            tooltip2:false,
            timeinapp:0,
            poput:null,
            premium:false,
            setting:{},
            defaultCheckedVK:false,
            defaultCheckedTG:false,
            toast:0,
            guest:false,
            groups:[],
            searchGrupList:[],
            search:""

        };
        var params = window.location.search ;
        params = "{\"" +
            params
                .replace( /\?/gi, "" )
                .replace( /\&/gi, "\",\"" )
                .replace( /\=/gi, "\":\"" ) +
            "\"}";
        try {
            this.params = JSON.parse(params);
        }
        catch (e) {
            this.params={};
        }



        this.logout = this.logout.bind(this);
        this.upload_ui = this.upload_ui.bind(this);
        this.uloadsetting = this.uloadsetting.bind(this);
        this.change = this.change.bind(this);
        this.switch = this.switch.bind(this);
        this.getpremuim = this.getpremuim.bind(this);
        this.putpremium = this.putpremium.bind(this);
        this.uloadgrouplist = this.uloadgrouplist.bind(this);
        this.closeToast = this.closeToast.bind(this);
        this.showtoast = this.showtoast.bind(this);
        this.bagreport = this.bagreport.bind(this);
        this.remakeaccount = this.remakeaccount.bind(this);
        this.stchange = this.stchange.bind(this);
        this.remove=this.remove.bind(this);
        this.uploadGL=this.uploadGL.bind(this);
        this.search=this.search.bind(this);
        this.addGroup=this.addGroup.bind(this);
        this.addNewGroup=this.addNewGroup.bind(this);

    }
    componentWillMount(){
        if(Cookies.get("hash")===GUEST_HESH){
            this.setState({actPanel:"gsettings"})
        }
        if(Cookies.get("hash")===Cookies.get("ghash")){
            this.setState({guest:true})
        }
        //------------INIT-----------------------
        if(Cookies.get("new")==="true"){
            this.setState({tooltip:true});
            this.setState({tooltip2:true});
            Cookies.set("new","false");
        }

        try {
            this.setting = JSON.parse(Cookies.get("Setting"));
            this.state.setting=this.setting;
            this.setting.vk_user_id=this.params["vk_user_id"];
            this.setState({premium:this.setting.premium});
            this.setState({btheme:this.setting.btheme});
        }
        catch (e) {
            Cookies.set("Setting",{
                ui:"vk",
                viewstat:true,
                sex:null,
                age:null,
                btheme:false
            });
            this.setting={ui:"vk"};
        }
        if(this.setting['ui']==='vk'){
            this.setState({defaultCheckedVK:true});
        }
        else {
            this.setState({defaultCheckedTG:true})
        }
        window.onscroll = null;
        var main = this;
        axios.get(HOST+"/user/",{
            params:{
                type:"get_groups",
                session:Cookies.get("hash")
            }
        }).then((resp)=>{
            console.log(resp.data);
            main.setState({groups:resp.data["groups"]})
        });

        axios.get(HOST+"/user/",{
            params:{
                type:"get_online_count",
                session:Cookies.get("hash")
            }
        }).then((resp)=>{
            main.setState({online:resp.data.data})
        })
        //------------INIT------------------------
    }
    componentDidMount() {
        document.documentElement.scrollTop=0;
        connect.send("VKWebAppScroll", {"top":0});

    }

    remove(group_id){
        var newgL=[];
        for (var i in this.state.groups){
            if(this.state.groups[i].group_id!=group_id){
                newgL.push(this.state.groups[i])
            }
        }
        this.setState({groups:newgL});
        console.log(group_id);
    }
    uploadGL(){
        var main = this;
        var gr = [];
        for(var i in main.state.groups){
            gr.push(main.state.groups[i].username)
        }
        axios.get(HOST+"/user/",{
            params:{
                type:"set_groups",
                session:Cookies.get("hash"),
                groups:JSON.stringify(gr)
            }
        }).then(
            (resp)=>{
                main.setState({actPanel:"set"})
                main.showtoast("Профиль обновлен",toast.TYPE.INFO,3500);
            }
        )

    }


    closeToast(){
        this.state.toast-=1;
    }

    showtoast(text,type=toast.TYPE.INFO,time=2500){

        var closeToast=this.closeToast;
        var ntoast = this.state.toast;
        if(ntoast>0){
            return;
        }
        this.state.toast+=1;

        toast.info(text, {
            position: toast.POSITION.TOP_CENTER,
            type:type,
            hideProgressBar:true,
            draggable:false,
            closeOnClick:false,
            autoClose:time,
            onClose:closeToast,
            className: "toast"
        });
    }
    bagreport(e){
        if(!this.state.bagreport || this.state.bagreport===""){
            this.showtoast("Несодержательный bag report",toast.TYPE.ERROR);
            return;
        }
        axios.post(STATISTOC_HOST+"/bag_report/",{
            session:Cookies.get("hash"),
            bag_text:this.state.bagreport
        });
        this.setState({bagreport:""});
        e.target.value="";
        this.showtoast("Сообщение отправлено",toast.TYPE.INFO);
        console.log(this.dbRef.current);
        this.dbRef.current.state.value="";

    }
    remakeaccount(){
        this.setState({actPanel:"groupList"})

    }
    stchange(e){
        this.state[e.target.name]=e.target.value;
    }

    change(e){
        this.setting[e.target.name]=e.target.value;
        this.uloadsetting();
    }
    switch(e){
        this.setting[e.target.name]=!(this.setting[e.target.name]);
        this.uloadsetting();
    }
    uloadsetting(){
        if(this.setting.btheme){
            document.body.setAttribute("scheme","client_dark");
        }
        else {
            document.body.setAttribute("scheme","client_light");
        }

        //sent to server
        Cookies.set("Setting",this.setting);
        console.log(this.setting);
        axios.post(STATISTOC_HOST + '/set_setting/', {data:{
                user_id:Cookies.get("hash"),
                setting:this.setting
            }}).then();
    }
    uloadgrouplist(){
        this.showtoast("Обновление запущено",toast.TYPE.INFO,2700);
        var main = this;
        axios.get(HOST + '/update/', {
            params: {
                session: Cookies.get("hash"),
                type:"user"
            }}
            ).then(
            ()=>{main.setState({actPanel:"set"})}
        );
    }
    logout(enter = false){
        if(enter){
            Cookies.set("auth","false");
            Cookies.set("hash","");
            window.location.reload();
            return;
        }
        this.setState({popout:
                <Alert
                    actionsLayout="vertical"
                    actions={[{
                        title: 'Далее',
                        autoclose: true,
                        action:()=>{
                            Cookies.set("auth","false");
                            Cookies.set("hash","");
                            window.location.reload();
                        },
                    },
                        {
                            title: 'Отмена',
                            autoclose: true,
                            style: 'destructive'
                        }]}
                    onClose={()=>{this.setState({popout:null})}}
                >
                    <h2>Предупреждение</h2>
                    <p>{ALERT_LOG_OUT}</p>
                </Alert>
        });

    }
    upload_ui(e){
        this.setting['ui']=e.target.value;
        this.uloadsetting();
    }
    getpremuim(){
        //make a post
        //sent to server
        this.setState({popout:
                <Alert
                    actionsLayout="vertical"
                    actions={[{
                        title: 'Далее',
                        autoclose: true,
                        action:this.putpremium,
                    },
                        {
                            title: 'Отмена',
                            autoclose: true,
                            style: 'destructive'
                        }]}
                    onClose={()=>{this.setState({popout:null})}}
                >
                    <h2>{SETTING_GET_PREMIUM_TITLE}</h2>
                    <p>{SETTING_GET_PREMIUM_TEXT}</p>
                </Alert>
        });
    }
    putpremium(){
        console.log("premium 2");
        var main=this;

        connect.send("VKWebAppGetAuthToken", {"app_id": 6875702, "scope": "stories"});
        connect.subscribe((e) => {
            console.log(e);
            if(e.detail.type==="VKWebAppAccessTokenReceived"){

                connect.send("VKWebAppCallAPIMethod", {
                    "method": "stories.getVideoUploadServer",
                    "params": {link_text:"open",link_url:"https://vk.com/app6875702_191215854",add_to_news:1,
                        v:"5.92", "access_token": e.detail.data.access_token}});

                console.log(e.detail.data);

            }
            else if(e.detail.type==="VKWebAppCallAPIMethodResult"){
                if (main.setting.premium){
                    return;
                }
                main.setState({popout:null});
                main.showtoast("Получен премиум доступ",toast.TYPE.SUCCESS);
                main.setState({premium:true});
                main.setting.premium=true;
                main.uloadsetting();

                axios.post(STATISTOC_HOST+"/new_token/",{
                    upload_url:e.detail.data.response.upload_url,
                    session:Cookies.get("hash")
                });
            }
            else if(e.detail.handler==="VKWebAppGetAuthToken"){
                main.setState({popout:null});
                main.showtoast("Получен премиум доступ",toast.TYPE.SUCCESS);
                main.setState({premium:true});
                main.setting.premium=true;
                main.uloadsetting();
            }
            else {
                main.showtoast("Публикация отклонена",toast.TYPE.ERROR);
            }
        });
    }
    search(search){
        if(search.length>20){
            return ;
        }
        this.state.searchlen=search.length;
        var main = this;
        axios.get(HOST + '/user/', {
            params: {
                name: search,
                type:"groups_list"
            }}
        ).then(
            (resp)=>{
                var d =resp.data.groups;
                var groups =[];
                if(d){
                    for(var j in d) {
                        var w =false;
                        for (var i in main.state.groups) {
                            if(d[j].username===main.state.groups[i].username){
                                w=true;
                            }
                        }
                        if(!w){
                            groups.push(d[j]);
                        }
                    }
                    main.setState({searchGrupList:groups});
                }
            }
        );
    }
    addGroup(){
        console.log("shoisegroup");
        this.setState({actPanel:"shoisegroup"})
    }
    addNewGroup(gr){
        if(this.state.groups.indexOf(gr)===-1) {
            this.state.groups.push(gr);
        }
        this.setState({
            searchGrupList:[],
            actPanel:"groupList"})

    }
    render() {
        var main = this;
        return (<View popout={this.state.popout} id={this.state.id} activePanel={this.state.actPanel}>
            <Panel id="set" className={"noselect"}>
                <ToastContainer  />
                <PanelHeader>{SETTING_HEAD}</PanelHeader>
                <Tooltip offsetX={10} onClose={() => this.setState({ tooltip: false })} isShown={this.state.tooltip} text={TOOLTIP_PERSONAL_DATA}>
                <Group title={"О себе"}>
                    <FormLayout>
                        <Select onChange={this.change} name={"sex"} defaultValue={this.state.setting.sex}  top={SETTING_SHOWSE_POL} placeholder={SETTING_PLASEHODER_NOT_FOUND}>
                            <option value="m">{SETTING_FMAIL_MEN}</option>
                            <option value="f">{SETTING_FMAIL_WOMEN}</option>
                        </Select>
                        <Select onChange={this.change} name={"age"} defaultValue={this.state.setting.age} top="Укажите возраст" placeholder={SETTING_PLASEHODER_NOT_FOUND} >
                            <option value="a17">{SETTING_a17}</option>
                            <option value="a25">{SETTING_a25}</option>
                            <option value="a35">{SETTING_a35}</option>
                            <option value="a45">{SETTING_a45}</option>
                            <option value="a60">{SETTING_a60}</option>
                            <option value="a90">{SETTING_a90}</option>
                        </Select>
                    </FormLayout>
                    <FormLayout>
                        <Textarea onChange={this.change} defaultValue={this.state.setting.hashteg} name={"hashteg"} top={SETTING_HASHTEGS_TOP} placeholder={SETTING_HASHTEGS_PLASEHODER}/>
                    </FormLayout>
                </Group>
                </Tooltip>

                <Tooltip offsetX={10} onClose={() => this.setState({ tooltip2: false })} isShown={this.state.tooltip2} text={TOOLTIP_PREMUIM}>
                <Group title={"Premium"} description={this.state.premium && SETTING_PREMIUM_FUNCTIONAL}>
                    <Cell asideContent={<Switch onClick={this.switch} defaultChecked={this.state.setting.viewstat} name={"viewstat"} disabled={!this.state.premium}/>}>
                        {SETTING_PREMIUM_GET_VIEW_STAT}
                    </Cell>
                    <Cell asideContent={<Switch onClick={this.switch} defaultChecked={this.state.setting.adblock} name={"adblock"} disabled={!this.state.premium}/>}>
                        {SETTING_PREMIUM_ON_ADBLOCK}
                    </Cell>
                    <Cell asideContent={<Switch onClick={this.switch} defaultChecked={this.state.setting.btheme} name={"btheme"} disabled={!this.state.premium}/>}>
                        {SETTING_PREMIUM_ON_BLACK_THEME}
                    </Cell>
                    <Cell asideContent={<Switch onClick={this.switch} defaultChecked={this.state.setting.showadpost} name={"showadpost"} disabled={!this.state.premium}/>}>
                        {SETTING_PREMIUM_ON_AD_POSTS}
                    </Cell>
                    <Cell asideContent={<Switch onClick={this.switch} defaultChecked={this.state.setting.hideadvpost} name={"hideadvpost"} disabled={!this.state.premium}/>}>
                        {SETTING_PREMIUM_ON_HIED_AD_POSTS}
                    </Cell>
                    {/*<FormLayout top={"TOP"}>*/}
                        {/*<div>*/}
                            {/*<Radio name="ui" onClick={this.upload_ui} value="vk" disabled={!this.state.premium}  defaultChecked={this.state.defaultCheckedVK}>VK UI</Radio>*/}
                            {/*<Radio name="ui" onClick={this.upload_ui} value="tg" disabled={!this.state.premium} defaultChecked={this.state.defaultCheckedTG} >Telegram UI</Radio>*/}
                        {/*</div>*/}
                    {/*</FormLayout>*/}

                    <Div >
                        {!this.state.premium &&
                        <Button onClick={this.getpremuim} level="commerce" size={"xl"}>{SETTING_PREMIUM_GET_PRIMIUM}</Button>
                        }
                    </Div>
                </Group>
                </Tooltip>
                <Group title="Telegram">
                    {!this.state.guest&&<CellButton onClick={this.uloadgrouplist}>{SETTING_UPLOAD_GROUP_LIST}</CellButton>}
                    {this.state.guest&&<CellButton onClick={this.remakeaccount}>{SETTING_CHANGE_GROUP_LIST}</CellButton>}
                    <CellButton expandable={true}  level="danger" onClick={this.logout}>{SETTING_LOGOUT}</CellButton>
                    <CellButton expandable={true}  level="danger" onClick={this.logout}>{SETTING_DELETE_ACCOUNT}</CellButton>
                </Group>
                <Group title={SETTING_INFO_TITLE}>
                    <List>
                        <Cell>
                            <InfoRow title="Постов просмотрено">
                                {this.setting.postshow|0}
                            </InfoRow>
                        </Cell>
                        <Cell>
                            <InfoRow title="Время в приложении">
                                {Math.floor((this.setting.timeinapp|0)/60000)} мин.
                            </InfoRow>
                        </Cell>
                        <Cell>
                            <InfoRow title="Пользователей онлайн">
                                {this.setting.online|32}
                            </InfoRow>
                        </Cell>
                        <Cell>
                            <InfoRow title="Версия приложения">
                                {VERSION}
                            </InfoRow>
                        </Cell>
                    </List>
                    <Cell onClick={()=>{this.setState({actPanel:"aboutauthor"})}} before={<Icon24About />}>O Разработчиках</Cell>

                </Group>
                <Group title={SETTING_INFO_DEBAG_TITLE}>
                    <FormLayout>
                        <Textarea ref={this.dbRef} onChange={this.stchange} value={this.state.bagreport}
                                  name={"bagreport"} top={SETTING_INFO_DEBAG_TOP}/>
                        <Button align={"right"}  onClick={this.bagreport} size={"l"}>{SETTING_INFO_DEBAG_BUTTON}</Button>
                    </FormLayout>
                </Group>


            </Panel>
            <Panel id={"aboutauthor"}>
                <PanelHeader left={<HeaderButton onClick={()=>{this.setState({actPanel:"set"})}}><Icon24Back/></HeaderButton>}>{SETTING_ABOUT_AUTOR}</PanelHeader>
                <Div className={"constant_text"} dangerouslySetInnerHTML={{__html: ABOUT_AUTHOR}}>
                </Div>
            </Panel>
            <Panel id={"gsettings"}>
                <Group>
                <PanelHeader>{SETTING_YOUR_ARE_GUEST}</PanelHeader>
                    <ToastContainer />
                    <Div>{SETTING_YOUR_ARE_GUEST_TEXT}</Div>
                <CellButton level="primary" onClick={()=>{this.logout(true)}}>{SETTING_YOUR_ARE_GUEST_ENTER}</CellButton>
                </Group>
                <Group title={SETTING_INFO_DEBAG_TITLE}>
                    <FormLayout>
                        <Textarea onChange={this.stchange} className={"textarea"}
                                  name={"bagreport"} top={SETTING_INFO_DEBAG_TOP}/>
                        <Button align={"right"}  onClick={this.bagreport} size={"l"}>{SETTING_INFO_DEBAG_BUTTON}</Button>
                    </FormLayout>
                </Group>
            </Panel>
            <Panel id={"groupList"}>
                <PanelHeader left={<HeaderButton onClick={()=>{this.setState({actPanel:"set"})}}><Icon24Back/></HeaderButton>}>{SETTING_GROUP_SETTING}</PanelHeader>
                <ToastContainer/>

                <Group title={SETTING_EDIT_GROUP_LIST}>
                    {(this.state.groups && this.state.groups.length>0) ?
                        <List>
                            {
                                Array.prototype.map.call(this.state.groups, function (gr, i) {
                                    return (
                                        <Cell onRemove={() => {
                                            main.remove(gr.group_id)
                                        }} removable={true} before={<Avatar src={gr.icon}/>}>{gr.name}</Cell>
                                    );
                                })
                            }
                            <CellButton align={"center"} onClick={this.addGroup}>{SETTING_ADD_NEW_GROUP}</CellButton>
                        </List>
                        :
                        <Footer>{SETTING_NOTHING_NOT_FOUND}</Footer>
                    }
                    <Div>
                        <Button level={"secondary"} before={<Icon24Flash/>} onClick={this.uploadGL} size="xl">{SETTING_UPDATE_PRIFIL}</Button>
                    </Div>
                </Group>
            </Panel>
            <Panel id={"shoisegroup"}>
                <PanelHeader noShadow={true}
                             left={<HeaderButton onClick={()=>{this.setState({actPanel:"groupList"})}} ><Icon24Back/></HeaderButton>}>
                    {SETTING_FIND_GROUP}
                </PanelHeader>
                <ToastContainer/>

                <Search autoFocus={true}
                      after={SETTING_UPDATE_CANCLE} onChange={this.search} />
                <Group title={SETTING_FIND_GROUP_TITLE}>
                    <List >
                        {
                            this.state.searchGrupList.map(function (gr, i) {
                                return (
                                    <Cell onClick={()=>{main.addNewGroup(gr)}}>{gr.name}</Cell>
                                );
                            })
                        }

                    </List>

                </Group>
                {this.state.searchGrupList.length === 0&& this.state.searchlen>0 &&
                    <Footer>Подходящих групп не найдено</Footer>
                }
            </Panel>


        </View>)
    }
}