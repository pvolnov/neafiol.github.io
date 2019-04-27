import React from 'react';
import {
    View,
    Div,
    ScreenSpinner,
    Checkbox,
    Select,
    FormLayout,
    FormLayoutGroup,
    Link,
    Group,
    CellButton,
    FormStatus,
    Input,
    Panel,
    PanelHeader,
    Button,
    Spinner,
    List,
    Cell,
    HeaderButton
} from "@vkontakte/vkui";
import Icon24Back from '@vkontakte/icons/dist/24/back';
import connect from '@vkontakte/vkui-connect-promise';
import Cookies from "js-cookie";
import axios from "axios";
import {HOST,GUEST_HESH} from "../constants/config";
import {USERDEAL} from "../constants/TextConstants";
import {COUNTRIES, GROUP_TYPES} from "../constants/ContentConstants";
import {ALERT_AUTH_TEXT,ALERT_AUTH_CANSEL_YOUR_SESSION,ALERT_AUTH_CODE_OWERTIME} from '../constants/TextConstants'
import VKConnect from '@vkontakte/vkui-connect-mock';
import {toast, ToastContainer} from "react-toastify";
import Icon24Flash from '@vkontakte/icons/dist/24/flash';
export default class AuthForm extends React.Component {
    constructor(props) {
        super(props);
        this.cbox = false;
        this.state = {
            errortext: null,
            errortitle: null,
            iser: false,
            actPanel: "telauth",
            id: props.id,
            code: "",
            poput: null,
            consent: 0,
            phone:"+7",
            user_info:{},
            guest:true,
            tg_auth:false
        };
        this.cond={
            phonewasget:false
        };
        this.httpClient = axios.create();
        this.httpClient.defaults.timeout = 14000;
        this.auth = this.auth.bind(this);
        this.onChange = this.onChange.bind(this);
        this.onShoise = this.onShoise.bind(this);
        this.logINasGues = this.logINasGues.bind(this);
        this.logINoldAccount = this.logINoldAccount.bind(this);
        this.getUserNomber = this.getUserNomber.bind(this);
        this.generateProfil = this.generateProfil.bind(this);
        this.uploadcountry = this.uploadcountry.bind(this);
        this.closeToast = this.closeToast.bind(this);

        if(Cookies.get("codewait")){
            this.state.actPanel="verficode";
            Cookies.set("codewait",false);
        }
        if(Cookies.get("ghash")){
            this.state.guest=false;
        }
        if(Cookies.get("tg_auth")){
            this.state.tg_auth=JSON.parse(Cookies.get("tg_auth"));
        }

    }
    closeToast(){
        this.state.toast-=1;
    }
    showtoast(text,type,autoClose=2000){
        var closeToast=this.closeToast;
        var ntoast = this.state.toast;
        if(ntoast>0){
            return;
        }
        this.state.toast+=1;

        toast.info(text, {
            position: toast.POSITION.TOP_CENTER,
            type:type,
            closeOnClick:false,
            draggable:false,
            onClose:closeToast,
            className: 'toast',
            autoClose:autoClose
        })
    }

    onChange(e) {
        if(e.target.name=="phone" && e.target.value.length>20 )return;
        this.setState({[e.target.name]: e.target.value})
    }
    onShoise(name){
        var user_info = this.state.user_info;
        user_info[name]=user_info[name]^1;
        console.log(user_info);
        this.setState({user_info:user_info})
    }
    getUserNomber() {
        if(this.cond.phonewasget){
            return;
        }
        this.cond.phonewasget=true;
        var main = this;


        connect.send("VKWebAppGetPhoneNumber", {}).then((data) => {
            if (data["type"] === "VKWebAppGetPhoneNumberResult") {
                main.setState({phone: "+"+data["data"]["phone_number"]});
            }
        });
    }

    auth(e) {

        var main = this;
        this.setState({popout: <ScreenSpinner/>});

        if (this.state.actPanel === "telauth") {
            if (this.state.consent < 1) {
                this.setState({
                    iser: true,
                    errortext: "Вы должны принять пользовательское соглашение",
                    errorеtitle: "Ошибка",
                    popout:null
                });
                return 0 ;
            }
            var phone = main.state.phone?main.state.phone:"+7";
            phone =phone.replace(/\s+/g,"");
            console.log(phone);

            axios.get(HOST + '/auth/', {
                    params: {
                        page: 1,
                        phone: phone
                    }
                }
            )
                .then(function (response) {
                    // response = (response.data);
                    var res = response.data;
                    console.log(res);

                    if (res['status'] === 'ok') {
                        main.setState({
                            popout: null,
                            actPanel: "verficode",
                            iser: 0
                        });
                        Cookies.set("hash", res['session']);
                        Cookies.set("guest", false);
                        Cookies.set("codewait", "true", { expires: 0.004});
                    }
                    else
                    if (res['status']==="valid") {
                        main.setState({
                            errortext: ALERT_AUTH_CANSEL_YOUR_SESSION,
                            errortitle: "Ошибка авторизации",
                            iser: 1,
                            popout: null

                        });
                    }
                    else {
                        main.setState({
                            errortext: res['status'],
                            errortitle: "Ошибка авторизации",
                            iser: 1,
                            popout: null

                        });
                    }
                })
                .catch(function (error) {
                    console.log(error);
                });
        }
        if (this.state.actPanel === "new_guest") {
            var nul=true;
            for(var u in this.state.user_info){
                if(this.state.user_info[u]===1)
                    nul=false;
            }
            if(nul){
                this.showtoast("Выберите хотя бы одну категорию",toast.TYPE.ERROR);
                this.setState({popout:null});
                return;
            }
            this.httpClient.get(HOST + '/auth/', {
                params: {
                    page: 3,
                    setting: this.state.user_info
                }

            })
                .then(function (response) {
                    // response = (response.data);
                    var res = response.data;
                    console.log(res);

                    if (res['status'] === 'ok') {
                        main.setState({
                            popout: null,
                            iser: 0
                        });
                        Cookies.set("hash", res['session']);
                        Cookies.set("ghash", res['session']);
                        Cookies.set("auth", "ok");
                        main.showtoast("Профиль генерируется",toast.TYPE.INFO,5000);
                        setTimeout(()=>{
                                window.location.reload()},
                            6000);

                    }else {
                        main.setState({
                            popout: null,
                        });
                        main.showtoast(res['status'] ,toast.TYPE.ERROR);
                    }

                }).catch(function (error) {
                    main.setState({
                        popout: null,
                    });
                    main.showtoast("Ошибка на сервере, попробуй позже",toast.TYPE.ERROR)

            });
        }
        if (this.state.actPanel === "verficode") {
                this.httpClient.get(HOST + '/auth/', {
                    params: {
                        page: 2,
                        session: Cookies.get("hash"),
                        code: this.state.code
                    }

                })
                .then(function (response) {
                    var res = response.data;
                    console.log(res);
                    if (res['status'] === 'ok') {
                        main.setState({
                            popout: null,
                            iser: 0
                        });
                        main.showtoast("Идет синхронизация постов",toast.TYPE.INFO,29700);
                        Cookies.set("auth", "ok");
                        Cookies.set("codewait",false);
                        Cookies.set("new", "true");
                        Cookies.set("tg_auth", JSON.stringify({
                            hash:Cookies.get("hash"),
                            phone:main.state.phone
                        }));
                        setTimeout(()=>{
                                window.location.reload()},
                            30000);

                    } else {
                        main.setState({
                            popout: null,
                        });
                        main.showtoast(res['status'] ,toast.TYPE.ERROR);
                    }

                }).catch(function (error) {
                main.setState({
                    popout: null,
                    errortext: "Во время синхронизации постов произошла критическая ошибка, нам очень жаль",
                    errortitle: "Ошибка",
                    iser: 1

                });
                console.log(error);
            });
        }

    }

    logINasGues(e) {
        Cookies.set("auth", "ok");
        Cookies.set("new","true");
        if(Cookies.get("ghash")){
            Cookies.set("hash", Cookies.get("ghash"));
        }
        else {
            Cookies.set("hash", GUEST_HESH);
        }
        window.location.reload();
    }
    logINoldAccount(e) {
        Cookies.set("auth", "ok");
        Cookies.set("hash", this.state.tg_auth.hash);

        window.location.reload();
    }
    generateProfil(){
        this.setState({actPanel:"new_guest"});
    }
    uploadcountry(e){
            var val = e.target.value;
            var phone="+";
            for (var c in COUNTRIES){
                if(COUNTRIES[c].co===val){
                    phone+=COUNTRIES[c].ph;
                    break;
                }
            }
            this.setState({
                "phone":phone,
                "country":e.target.value});

    }


    render() {
        var main=this;

        return (<View popout={this.state.popout} id={this.state.id} activePanel={this.state.actPanel}>
            <Panel id={"telauth"} >
                <PanelHeader>Авторизация</PanelHeader>
                <FormLayout status={1}>
                    {(this.state.iser) &&
                    <FormStatus title={this.state.errortitle} state="error">
                        {this.state.errortext}
                    </FormStatus>
                    }
                    <Select defaultValue={"ru"} onChange={this.uploadcountry} >
                        {
                            COUNTRIES.map((country)=>{
                                return (
                                    <option  name={country.ph} value={country.co}>{country.na.substr(0,30)}</option>
                                )
                        })
                        }
                    </Select>
                    <FormLayoutGroup top="Введите ваш номер телефона">
                        <Input  status={"default"} onChange={this.onChange} name={"phone"} type="tel" autocorrect="off" autocomplete="tel"
                               value={this.state.phone} onClick={this.getUserNomber}/>
                        <Button size="xl" onClick={this.auth}>Далее</Button>
                    </FormLayoutGroup>
                    <Checkbox  onClick={(e) => {
                        if(this.cbox ){
                            this.cbox=false;
                            return false;
                        }
                        console.log("k");
                        this.state.consent ^= 1;
                    }}>Я принимаю условия пользовательского <Link onClick={()=>{
                        // this.state.consent ^= 1;
                        this.cbox=true;
                        console.log("k2");
                        this.setState({actPanel:"userdeal"});
                        return false;

                    }}>соглашения</Link> </Checkbox>
                </FormLayout>
                <Group title="Хочешь просто опробовать функционал?">
                    {this.state.guest && <CellButton size="m" onClick={this.logINasGues}>Войти как гость</CellButton>}
                    {this.state.guest && <CellButton size="m" onClick={this.generateProfil}>Сгенерировать профиль</CellButton>}
                    {!this.state.guest&&<CellButton size="m" onClick={this.logINasGues}>Войти в сгенерированый профиль</CellButton>}
                    {this.state.tg_auth&&<CellButton size="m" onClick={this.logINoldAccount}>Войти в telegram {this.state.tg_auth.phone}</CellButton>}
                    </Group>
            </Panel>
            <Panel id={"verficode"}>
                <ToastContainer />
                <PanelHeader left={<HeaderButton onClick={()=>{this.setState({actPanel:"telauth"})}}><Icon24Back/></HeaderButton>}>Ваш код</PanelHeader>
                <FormLayout>
                    {(this.state.iser) &&
                    <FormStatus title={this.state.errortitle} state="error">
                        {this.state.errortext}
                    </FormStatus>
                    }
                    <FormLayoutGroup top="Введите код подтверждения" bottom={ALERT_AUTH_TEXT}>
                        <Input type="tel" onChange={this.onChange} value={this.state.code} name={"code"} placeholder={"Код подтверждения"}/>
                        <Button onClick={this.auth} size="xl">Войти</Button>
                    </FormLayoutGroup>

                </FormLayout>
            </Panel>
            <Panel id={"userdeal"}>
                <PanelHeader left={<HeaderButton onClick={()=>{this.setState({actPanel:"telauth"})}}><Icon24Back/></HeaderButton>}>Пользовательское соглашение</PanelHeader>
                <Div><p className={"constant_text"} dangerouslySetInnerHTML={{__html: USERDEAL}}>
                    </p>
                </Div>
            </Panel>
            <Panel id={"new_guest"}>
                <PanelHeader left={<HeaderButton onClick={()=>{this.setState({actPanel:"telauth"})}}><Icon24Back/></HeaderButton>}>Генерация профиля</PanelHeader>
                <ToastContainer/>
                <Group top={"Что тебе интересно?"}>
                    <List>{
                            Array.prototype.map.call(GROUP_TYPES, function (gt, i) {
                                return (
                                    <Cell selectable={true} onClick={()=>{main.onShoise(gt.value)}} >{gt.name}</Cell>
                                );
                            })
                        }
                    </List>

                    <Div>
                    <Button level={"secondary"} before={<Icon24Flash/>} onClick={this.auth} size="xl">Сгенерировать профиль</Button>
                    </Div>
                </Group>
            </Panel>
        </View>)
    }
}