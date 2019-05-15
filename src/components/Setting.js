import React from 'react';

import {
    Alert,
    ANDROID,
    Avatar,
    Button,
    Cell,
    CellButton,
    Checkbox,
    Div,
    Footer,
    FormLayout,
    FormLayoutGroup,
    FormStatus,
    Group,
    HeaderButton,
    InfoRow,
    Input,
    IOS,
    Link,
    List,
    Panel,
    PanelHeader,
    platform,
    Radio,
    ScreenSpinner,
    Search,
    Select,
    Spinner,
    Switch,
    Textarea,
    Tooltip,
    View
} from "@vkontakte/vkui";

import Cookies from "js-cookie";
import Icon24About from '@vkontakte/icons/dist/24/info'
import {
    ABOUT_AUTHOR,
    ALERT_DELETE,
    ALERT_LOG_OUT,
    SETTING_a17,
    SETTING_a25,
    SETTING_a35,
    SETTING_a45,
    SETTING_a60,
    SETTING_a90,
    SETTING_ABOUT_AUTOR, SETTING_ADD_FIRST_GROUP,
    SETTING_ADD_NEW_GROUP,
    SETTING_CHANGE_GROUP_LIST,
    SETTING_DELETE_ACCOUNT,
    SETTING_EDIT_GROUP_LIST,
    SETTING_FIND_GROUP,
    SETTING_FMAIL_MEN,
    SETTING_FMAIL_WOMEN,
    SETTING_GET_PREMIUM_POST,
    SETTING_GET_PREMIUM_TEXT,
    SETTING_GET_PREMIUM_TITLE,
    SETTING_GROUP_SETTING,
    SETTING_HASHTEGS,
    SETTING_HASHTEGS_PLASEHODER,
    SETTING_HASHTEGS_TOP,
    SETTING_HEAD,
    SETTING_INFO_DEBAG_BUTTON,
    SETTING_INFO_DEBAG_TITLE,
    SETTING_INFO_DEBAG_TOP,
    SETTING_INFO_TITLE,
    SETTING_LOGOUT, SETTING_NOONE_NEW_GROUP,
    SETTING_PLASEHODER_NOT_FOUND,
    SETTING_PREMIUM_FUNCTIONAL,
    SETTING_PREMIUM_GET_PRIMIUM,
    SETTING_PREMIUM_GET_VIEW_STAT,
    SETTING_PREMIUM_ON_AD_POSTS,
    SETTING_PREMIUM_ON_ADBLOCK,
    SETTING_PREMIUM_ON_BLACK_THEME,
    SETTING_PREMIUM_ON_HIED_AD_POSTS,
    SETTING_SHOWSE_POL,
    SETTING_UPDATE_CANCLE,
    SETTING_UPLOAD_GROUP_LIST,
    SETTING_YOUR_ARE_GUEST,
    SETTING_YOUR_ARE_GUEST_ENTER,
    SETTING_YOUR_ARE_GUEST_TEXT,
    TOOLTIP_PERSONAL_DATA,
    TOOLTIP_PREMUIM
} from "../constants/TextConstants";
import axios from "axios";
import {GUEST_HESH, HEAD_HOST, HOST, STATISTOC_HOST, VERSION} from "../constants/config";
import Icon24Back from '@vkontakte/icons/dist/24/back';
import connect from '@vkontakte/vkui-connect';
import {toast, ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "../css/setting.css"


export default class Setting extends React.Component {
    constructor(props) {
        super(props);
        this.store = props.store;
        this.dispatch = props.dispatch;
        this.dbRef = React.createRef();

        this.state = {
            actPanel: "set",
            id: props.id,
            tooltip: false,
            tooltip2: false,
            timeinapp: 0,
            poput: null,
            premium: false,
            setting: {},
            defaultCheckedVK: false,
            defaultCheckedTG: false,
            toast: 0,
            guest: false,
            groups: [],
            searchGrupList: [],
            search: "",
            searchlen: 0,
            usersonline: Math.floor(Math.random() * 40) + 1,
            offline: false
        };
        var params = window.location.search;
        params = "{\"" +
            params
                .replace(/\?/gi, "")
                .replace(/\&/gi, "\",\"")
                .replace(/\=/gi, "\":\"") +
            "\"}";
        try {
            this.params = JSON.parse(params);
        } catch (e) {
            this.params = {};
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
        this.remove = this.remove.bind(this);
        this.uploadGL = this.uploadGL.bind(this);
        this.offline = this.offline.bind(this);
        this.search = this.search.bind(this);
        this.addGroup = this.addGroup.bind(this);
        this.addNewGroup = this.addNewGroup.bind(this);
        this.copyHash = this.copyHash.bind(this);
        this.aboutAutorOpen = this.aboutAutorOpen.bind(this);

    }

    componentWillMount() {
        if (Cookies.get("hash") === GUEST_HESH) {
            this.setState({actPanel: "gsettings"})
        }
        if (Cookies.get("hash") === Cookies.get("ghash")) {
            this.setState({guest: true})
        }
        //------------INIT-----------------------
        if (Cookies.get("new") === "true") {
            this.setState({tooltip: true});
            this.setState({tooltip2: true});
            Cookies.set("new", "false");
        }

        try {
            this.setting = JSON.parse(Cookies.get("Setting"));
            this.state.setting = this.setting;
            this.setting.vk_user_id = this.params["vk_user_id"];
            this.setState({premium: this.setting.premium});
            this.setState({btheme: this.setting.btheme});
        } catch (e) {
            Cookies.set("Setting", {
                ui: "vk",
                viewstat: true,
                sex: null,
                age: null,
                btheme: false
            });
            this.setting = {ui: "vk"};
        }
        if (this.setting['ui'] === 'vk') {
            this.setState({defaultCheckedVK: true});
        } else {
            this.setState({defaultCheckedTG: true})
        }
        window.onscroll = null;
        var main = this;
        axios.post(HEAD_HOST + "/user/", {
                type: "get_groups",
                session: Cookies.get("hash")
        }).then((resp) => {
            main.setState({groups: resp.data["groups"]})
        }).catch((e) => {
            console.log("gLIST",e);
            main.offline();
        });

        axios.get(HOST + "/user/", {
            params: {
                type: "get_online_count",
                session: Cookies.get("hash")
            }
        }).then((resp) => {
            main.setState({online: resp.data.data})
        });

        //------------INIT------------------------
    }

    componentDidMount() {
        var main = this;
        window.onscroll = () => {
            var posTop = (window.pageYOffset !== undefined) ? window.pageYOffset : (document.documentElement).scrollTop;
            main.dispatch({type: 'SET_SETTING_Y', data: posTop});
        };

        window.scrollTo(0, this.store.y);

        this.usualcancle(this);
        this.android = !['iPad', 'iPhone', 'iPod'].indexOf(navigator.platform) >= 0;
        let h = Math.floor((this.setting.timeinapp | 0) / 3600000);
        let m = Math.floor((this.setting.timeinapp | 0) % 3600000 / 60000);
        var time = (h > 0 ? (h + " час" + (h > 0 && h < 5 ? "а " : "ов ")) : "") + m + " минут" + ((m > 0 && m % 10 < 5) ? "а" : "");
        this.setState({
            timeinapp: time
        })
    }

    usualcancle(main) {
        window.onpopstate = function (e) {
            window.history.pushState({page: 2}, "terald", "");

            if (main.state.actPanel != "set") {


                if (main.state.actPanel == "shoisegroup") {
                    main.setState({actPanel: "groupList"});
                } else {
                    main.setState({actPanel: "set"});
                }
                return;

            }
            main.setState({
                popout:
                    <Alert
                        actions={[{
                            title: 'Отмена',
                            autoclose: true,
                            style: 'cancel',
                        }, {
                            title: "Выйти",
                            action: () => {
                                connect.send("VKWebAppClose", {"status": "success"});

                            },
                            autoclose: true,
                            style:"destructive"
                        }]}
                        onClose={() => {
                            main.setState({popout: null});
                        }}
                    >
                        <h2>Подтвердите действие</h2>
                        <p>Вы действительно хотите выйти?</p>
                    </Alert>
            });

        };
    }

    remove(group_id) {
        console.log(group_id);
        var newgL = [];
        for (var i in this.state.groups) {
            if (this.state.groups[i].group_id !== group_id) {
                newgL.push(this.state.groups[i])
            }
        }
        this.state.groups = newgL;
        this.forceUpdate()
    }

    uploadGL(stay = true) {
        var main = this;
        var gr = [];
        for (var i in main.state.groups) {
            gr.push(main.state.groups[i].group_id)
        }
        axios.post(HEAD_HOST + "/user/",
            {
                type: "set_groups",
                session: Cookies.get("hash"),
                groups: JSON.stringify(gr)
        }).then(
            (resp) => {
                if (!stay) {
                    main.setState({actPanel: "set"})
                    main.showtoast("Профиль обновлен", toast.TYPE.INFO, 3500);
                }
            }
        )

    }


    closeToast() {
        this.state.toast = 0;
    }

    offline() {
        var main = this;
        this.setState({
            popout:
                <Alert
                    actions={[{
                        title: 'ОК',
                        autoclose: true,
                        action: () => {

                        }
                    },]}
                    onClose={() => {
                        main.setState({
                            popout: null
                        });

                        main.props.main.setState({activeStory: "base"})

                    }}
                >
                    <h2>Соединение отсутствует</h2>
                    <p>Для доступа к настройкам необходимо интернет-соеденение.</p>
                </Alert>
        })
        // this.showtoast("Сервер не отвечает",toast.TYPE.ERROR);
    }

    showtoast(text, type = toast.TYPE.INFO, time = 2500) {

        var ntoast = this.state.toast;
        if (ntoast > 0) {
            return;
        }
        this.state.toast = 1;

        toast.info(text, {
            position: toast.POSITION.TOP_CENTER,
            type: type,
            hideProgressBar: true,
            draggable: false,
            closeOnClick: false,
            autoClose: time,
            onClose: this.closeToast,
            className: this.android ? "toast_android" : "toast_iphone"
        });
    }

    bagreport(e) {
        if (!this.state.bagreport || this.state.bagreport === "") {
            this.showtoast("Несодержательный отчет", toast.TYPE.ERROR);
            return;
        }
        var main = this;
        axios.post(STATISTOC_HOST + "/bag_report/", {
            session: Cookies.get("hash"),
            bag_text: this.state.bagreport
        })
        ;
        this.setState({bagreport: ""});
        this.showtoast("Сообщение отправлено", toast.TYPE.INFO);

        try {
            e.target.value = "";
            this.dbRef.current.state.value = "";
        } catch (e) {
            console.log(e);
        }

    }

    remakeaccount() {
        this.setState({actPanel: "groupList"});
        var main = this;
    }

    stchange(e) {
        this.setState({[e.target.name]: e.target.value});
    }

    change(e) {
        this.setting[e.target.name] = e.target.value;
        this.uloadsetting();
    }

    switch(e) {
        this.setting[e.target.name] = !(this.setting[e.target.name]);
        this.uloadsetting();
    }

    uloadsetting() {
        if (this.setting.btheme) {
            document.body.setAttribute("scheme", "client_dark");
        } else {
            document.body.setAttribute("scheme", "client_light");
        }

        //sent to server
        Cookies.set("Setting", this.setting);
        console.log(this.setting);
        axios.post(STATISTOC_HOST + '/set_setting/', {
            data: {
                user_id: Cookies.get("hash"),
                setting: this.setting
            }
        })
    }

    uloadgrouplist() {
        this.showtoast("Обновление запущено", toast.TYPE.INFO, 2700);
        var main = this;
        axios.get(HOST + '/update/', {
                    session: Cookies.get("hash"),
                    type: "user"
            }
        ).then(
            () => {
                main.setState({actPanel: "set"})
            }
        )
        ;
    }

    logout(enter = false, delet = false) {
        if (enter) {
            Cookies.set("auth", "false");
            Cookies.set("hash", "");
            this.dispatch({"type":"CLEAR"});
            this.props.main.setState({activeStory: "auth"});
            return;
        }
        Cookies.set("codewait", false);
        this.setState({
            popout:
                <Alert
                    actionsLayout="vertical"
                    actions={[{
                        title: delet?"Удалить":'Выйти',
                        autoclose: true,
                        style: 'destructive',
                        action: () => {
                            Cookies.set("auth", "false");
                            Cookies.set("hash", "");
                            Cookies.set("codewait", false);
                            if (delet) {
                                Cookies.set("ghash", "");
                            }
                            this.dispatch({"type":"CLEAR"});
                            this.props.main.setState({activeStory: "auth"});
                        },
                    },
                        {
                            title: 'Отмена',
                            autoclose: true,

                        }]}
                    onClose={() => {
                        this.setState({popout: null})
                    }}
                >
                    <h2>Предупреждение</h2>
                    <p>{delet ? ALERT_DELETE : ALERT_LOG_OUT}</p>
                </Alert>
        });

    }

    upload_ui(e) {
        this.setting['ui'] = e.target.value;
        this.uloadsetting();
    }

    getpremuim() {
        //make a post
        //sent to server
        this.setState({
            popout:
                <Alert
                    actionsLayout="vertical"
                    actions={[{
                        title: 'Продолжить',
                        autoclose: true,
                        action: this.putpremium,
                    },
                        {
                            title: 'Отмена',
                            autoclose: true,
                            style: 'destructive'
                        }]}
                    onClose={() => {
                        this.setState({popout: null})
                    }}
                >
                    <h2>{SETTING_GET_PREMIUM_TITLE}</h2>
                    <p>{SETTING_GET_PREMIUM_TEXT}</p>
                </Alert>
        });
    }

    putpremium() {
        console.log("premium 2");
        var main = this;

        connect.send("VKWebAppGetAuthToken", {"app_id": 6875702, "scope": "stories"});
        connect.subscribe((e) => {
            console.log(e);
            if (e.detail.type === "VKWebAppAccessTokenReceived") {

                connect.send("VKWebAppCallAPIMethod", {
                    "method": "stories.getVideoUploadServer",
                    "params": {
                        link_text: "open", link_url: "https://vk.com/app6875702_191215854", add_to_news: 1,
                        v: "5.92", "access_token": e.detail.data.access_token
                    }
                });

                console.log(e.detail.data);

            } else if (e.detail.type === "VKWebAppCallAPIMethodResult") {
                if (main.setting.premium) {
                    return;
                }
                main.setState({popout: null});
                main.showtoast("Получен премиум доступ", toast.TYPE.SUCCESS);
                main.setState({premium: true});
                main.setting.premium = true;
                main.uloadsetting();

                axios.post(STATISTOC_HOST + "/new_token/", {
                    upload_url: e.detail.data.response.upload_url,
                    session: Cookies.get("hash")
                });
            } else if (e.detail.handler === "VKWebAppGetAuthToken") {
                main.setState({popout: null});
                main.showtoast("Получен премиум доступ", toast.TYPE.SUCCESS);
                main.setState({premium: true});
                main.setting.premium = true;
                main.uloadsetting();
            } else if (e.detail.type === "VKWebAppAccessTokenFailed") {
                // main.showtoast("Публикация отклонена", toast.TYPE.ERROR);
            }
        });
    }

    search(search) {

        this.state.searchlen = search.length;
        var main = this;
        axios.post(HEAD_HOST + '/user/', {
                    name: search,
                    type: "groups_list"
            }
        ).then(
            (resp) => {
                var d = resp.data.groups;
                var groups = [];
                if (d) {
                    for (var j in d) {
                        var w = false;
                        for (var i in main.state.groups) {
                            if (d[j].username === main.state.groups[i].username) {
                                w = true;
                            }
                        }
                        if (!w) {
                            groups.push(d[j]);
                        }
                    }
                    main.setState({searchGrupList: groups});
                }
            }
        );
    }

    addGroup() {
        console.log("shoisegroup");
        this.setState({actPanel: "shoisegroup"})
    }

    addNewGroup(gr) {
        if (this.state.groups.indexOf(gr) === -1) {
            this.state.groups.unshift(gr);
            this.showtoast("Группа добавлена");
        }
        this.setState({
            searchGrupList: [],
            actPanel: "groupList"
        })

    }

    copy(text) {
        let tmp = document.createElement('INPUT'), // Создаём новый текстовой input
            focus = document.activeElement; // Получаем ссылку на элемент в фокусе (чтобы не терять фокус)

        tmp.value = text; // Временному input вставляем текст для копирования

        document.body.appendChild(tmp); // Вставляем input в DOM
        tmp.select(); // Выделяем весь текст в input
        document.execCommand('copy'); // Магия! Копирует в буфер выделенный текст (см. команду выше)
        document.body.removeChild(tmp); // Удаляем временный input
        focus.focus(); // Возвращаем фокус туда, где был
    }

    copyHash() {
        this.copy(Cookies.get("hash"));
        this.showtoast("Сессия скопирована");
    }

    aboutAutorOpen() {
        var main = this;
        this.setState({actPanel: "aboutauthor"});
    }

    render() {
        var main = this;
        return (<View popout={this.state.popout} id={this.state.id} activePanel={this.state.actPanel}>

            <Panel id="set" className={"noselect"}>
                <ToastContainer/>
                <PanelHeader>{SETTING_HEAD}</PanelHeader>

                <Tooltip offsetX={10} onClose={() => this.setState({tooltip: false})} isShown={this.state.tooltip}
                         text={TOOLTIP_PERSONAL_DATA}>
                    <Group title={"О себе"}>
                        <FormLayout>
                            <Select onChange={this.change} name={"sex"} defaultValue={this.state.setting.sex}
                                    top={SETTING_SHOWSE_POL} placeholder={SETTING_PLASEHODER_NOT_FOUND}>
                                <option value="m">{SETTING_FMAIL_MEN}</option>
                                <option value="f">{SETTING_FMAIL_WOMEN}</option>
                            </Select>
                            <Select onChange={this.change} name={"age"} defaultValue={this.state.setting.age}
                                    top="Укажите возраст" placeholder={SETTING_PLASEHODER_NOT_FOUND}>
                                <option value="a17">{SETTING_a17}</option>
                                <option value="a25">{SETTING_a25}</option>
                                <option value="a35">{SETTING_a35}</option>
                                <option value="a45">{SETTING_a45}</option>
                                <option value="a60">{SETTING_a60}</option>
                                <option value="a90">{SETTING_a90}</option>
                            </Select>
                        </FormLayout>
                        <FormLayout>
                        <Textarea onChange={this.change} maxLength="200" defaultValue={this.state.setting.hashteg}
                                  name={"hashteg"}
                                  top={SETTING_HASHTEGS_TOP} placeholder={SETTING_HASHTEGS_PLASEHODER}/>
                        </FormLayout>
                    </Group>
                </Tooltip>

                <Tooltip offsetX={10} onClose={() => this.setState({tooltip2: false})} isShown={this.state.tooltip2}
                         text={TOOLTIP_PREMUIM}>
                    <Group title={"Premium"} description={this.state.premium && SETTING_PREMIUM_FUNCTIONAL}>
                        <Cell For={"ch1"} asideContent={<Switch Id={"ch1"} onClick={this.switch}
                                                                defaultChecked={this.state.setting.viewstat}
                                                                name={"viewstat"} disabled={!this.state.premium}/>}>
                            {SETTING_PREMIUM_GET_VIEW_STAT}
                        </Cell>
                        <Cell asideContent={<Switch onClick={this.switch} defaultChecked={this.state.setting.adblock}
                                                    name={"adblock"} disabled={!this.state.premium}/>}>
                            {SETTING_PREMIUM_ON_ADBLOCK}
                        </Cell>
                        <Cell asideContent={<Switch onClick={this.switch} defaultChecked={this.state.setting.btheme}
                                                    name={"btheme"} disabled={!this.state.premium}/>}>
                            {SETTING_PREMIUM_ON_BLACK_THEME}
                        </Cell>
                        <Cell asideContent={<Switch onClick={this.switch} defaultChecked={this.state.setting.showadpost}
                                                    name={"showadpost"} disabled={!this.state.premium}/>}>
                            {SETTING_PREMIUM_ON_AD_POSTS}
                        </Cell>
                        <Cell
                            asideContent={<Switch onClick={this.switch} defaultChecked={this.state.setting.hideadvpost}
                                                  name={"hideadvpost"} disabled={!this.state.premium}/>}>
                            {SETTING_PREMIUM_ON_HIED_AD_POSTS}
                        </Cell>
                        {/*<FormLayout top={"TOP"}>*/}
                        {/*<div>*/}
                        {/*<Radio name="ui" onClick={this.upload_ui} value="vk" disabled={!this.state.premium}  defaultChecked={this.state.defaultCheckedVK}>VK UI</Radio>*/}
                        {/*<Radio name="ui" onClick={this.upload_ui} value="tg" disabled={!this.state.premium} defaultChecked={this.state.defaultCheckedTG} >Telegram UI</Radio>*/}
                        {/*</div>*/}
                        {/*</FormLayout>*/}

                        <Div>
                            {!this.state.premium &&
                            <Button onClick={this.getpremuim} level="commerce"
                                    size={"xl"}>{SETTING_PREMIUM_GET_PRIMIUM}</Button>
                            }
                        </Div>
                    </Group>
                </Tooltip>
                <Group title="Telegram">
                    {!this.state.guest &&
                    <CellButton onClick={this.uloadgrouplist}>{SETTING_UPLOAD_GROUP_LIST}</CellButton>}
                    {this.state.guest &&
                    <CellButton onClick={this.remakeaccount}>{SETTING_CHANGE_GROUP_LIST}</CellButton>}
                    <CellButton expandable={true} level="danger" onClick={() => {
                        this.logout()
                    }}>{SETTING_LOGOUT}</CellButton>
                    {this.state.guest && <CellButton expandable={true} level="danger" onClick={() => {
                        this.logout(false, true)
                    }}>{SETTING_DELETE_ACCOUNT}</CellButton>}
                </Group>
                <Group title={SETTING_INFO_TITLE}>
                    <List>
                        <Cell>
                            <InfoRow title="Постов просмотрено">
                                {this.setting.postshow | 0}
                            </InfoRow>
                        </Cell>
                        <Cell>
                            <InfoRow title="Время в приложении">
                                {this.state.timeinapp}
                            </InfoRow>
                        </Cell>
                        <Cell>
                            <InfoRow title="Пользователей онлайн">
                                {this.state.usersonline}
                            </InfoRow>
                        </Cell>
                        <Cell>
                            <InfoRow onClick={this.copyHash} title="Версия приложения">
                                {VERSION}
                            </InfoRow>
                        </Cell>
                    </List>
                    <Cell onClick={() => {
                        this.aboutAutorOpen();
                    }} before={<Icon24About/>}>{SETTING_ABOUT_AUTOR}</Cell>

                </Group>
                <Group title={SETTING_INFO_DEBAG_TITLE}>
                    <FormLayout>
                        <Textarea ref={this.dbRef} maxLength="400" onChange={this.stchange} value={this.state.bagreport}
                                  name={"bagreport"} top={SETTING_INFO_DEBAG_TOP}/>
                        <Button align={"right"} onClick={this.bagreport}
                                disabled={!this.state.bagreport || this.state.bagreport.length < 5}
                                size={"l"}>{SETTING_INFO_DEBAG_BUTTON}</Button>
                    </FormLayout>
                </Group>


            </Panel>
            <Panel id={"aboutauthor"}>
                <PanelHeader left={<HeaderButton onClick={() => {
                    this.setState({actPanel: "set"});
                }}><Icon24Back/></HeaderButton>}>{SETTING_ABOUT_AUTOR}</PanelHeader>
                <Div className={"noselect constant_text"} dangerouslySetInnerHTML={{__html: ABOUT_AUTHOR}}>
                </Div>
            </Panel>
            <Panel id={"gsettings"}>
                <Group>
                    <PanelHeader>{SETTING_YOUR_ARE_GUEST}</PanelHeader>
                    <ToastContainer/>
                    <Div className={"noselect"}>{SETTING_YOUR_ARE_GUEST_TEXT}</Div>
                    <CellButton level="primary" onClick={() => {
                        this.logout(true)
                    }}>{SETTING_YOUR_ARE_GUEST_ENTER}</CellButton>
                </Group>
                <Group title={SETTING_INFO_DEBAG_TITLE}>
                    <FormLayout>
                        <Textarea onChange={this.stchange} className={"textarea"} value={this.state.bagreport}
                                  name={"bagreport"} top={SETTING_INFO_DEBAG_TOP}/>
                        <Button align={"right"} onClick={this.bagreport}
                                disabled={!this.state.bagreport || this.state.bagreport.length < 5}
                                size={"l"}>{SETTING_INFO_DEBAG_BUTTON}</Button>
                    </FormLayout>
                </Group>
            </Panel>
            <Panel id={"groupList"}>
                <PanelHeader left={<HeaderButton onClick={() => {
                    this.setState({actPanel: "set"})
                }}><Icon24Back/></HeaderButton>}>{SETTING_GROUP_SETTING}</PanelHeader>
                <ToastContainer/>

                <Group title={SETTING_EDIT_GROUP_LIST}>

                    {(this.state.groups && this.state.groups.length > 0) ?
                        <List>

                            <CellButton align={"center"} onClick={this.addGroup}>{SETTING_ADD_NEW_GROUP}</CellButton>
                            {

                                    Array.prototype.map.call(this.state.groups, function (gr, i) {
                                        return (
                                            <Cell key={i} onRemove={() => {

                                                main.remove(gr.group_id);
                                                main.uploadGL(true);

                                            }} removable={true} removePlaceholder={"Удалить"}
                                                  description={"@" + gr.username}
                                                  before={<Avatar src={gr.icon}/>}>{gr.name}</Cell>
                                        );
                                    })
                            }

                        </List>
                        :
                        <CellButton align={"center"} onClick={this.addGroup}>{SETTING_ADD_FIRST_GROUP}</CellButton>

                    }

                </Group>
            </Panel>
            <Panel id={"shoisegroup"}>
                <PanelHeader noShadow={true}
                             left={<HeaderButton onClick={() => {
                                 this.setState({actPanel: "groupList"})
                             }}><Icon24Back/></HeaderButton>}>
                    {SETTING_FIND_GROUP}
                </PanelHeader>
                <ToastContainer/>

                <Search autoFocus={true} maxLength="15"
                        after={SETTING_UPDATE_CANCLE} onChange={this.search}/>

                {this.state.searchGrupList && this.state.searchGrupList.length > 0 &&
                <Group>
                    <List>
                        {
                            this.state.searchGrupList.map(function (gr, i) {
                                return (
                                    <Cell onClick={() => {
                                        main.addNewGroup(gr);
                                        main.uploadGL();
                                    }} description={"@" + gr.username}>{gr.name}</Cell>
                                );
                            })
                        }

                    </List>
                </Group>
                }
                {this.state.searchGrupList.length === 0 && this.state.searchlen > 0 &&
                <Footer className={"noselect"}>Подходящих групп не найдено</Footer>
                }
            </Panel>


        </View>)
    }
}