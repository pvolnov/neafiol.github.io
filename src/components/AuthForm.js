import React from 'react';
import {
    Alert,
    Button,
    Cell,
    CellButton,
    Checkbox,
    Div,
    FormLayout,
    FormLayoutGroup,
    FormStatus,
    Group,
    HeaderButton,
    InfoRow,
    Input,
    Link,
    List,
    Panel,
    PanelHeader, platform,
    Progress,
    ScreenSpinner,
    Select,
    Spinner,
    FixedLayout,
    IOS,
    View
} from "@vkontakte/vkui";
import Icon24Back from '@vkontakte/icons/dist/24/back';
import connect from '@vkontakte/vkui-connect-promise';
import Cookies from "js-cookie";
import axios from "axios";
import {GUEST_HESH, HEAD_HOST, HOST, STATISTOC_HOST} from "../constants/config";
import {ALERT_AUTH_CANSEL_YOUR_SESSION, ALERT_AUTH_TEXT, USERDEAL} from "../constants/TextConstants";
import {COUNTRIES, GROUP_TYPES} from "../constants/ContentConstants";
import {toast, ToastContainer} from "react-toastify";
import Icon24Flash from '@vkontakte/icons/dist/24/flash';
import {PathToJson} from "../function";


export default class AuthForm extends React.Component {
    constructor(props) {
        super(props);
        this.cbox = false;
        this.state = {
            errortext: null,
            errortitle: null,
            iser: false,
            errortext2: null,
            errortitle2: null,
            iser2: false,
            actPanel: "telauth",
            id: props.id,
            code: "",
            poput: null,
            consent: 0,
            phone: "+7",
            phoneprefix: "+7",
            country: "ru",
            user_info: {},
            guest: true,
            tg_auth: false,
            generation: 0
        };

        this.cond = {
            phonewasget: false
        };
        this.httpClient = axios.create();
        this.httpClient.defaults.timeout = 18000;
        this.android = platform() === "android";
        this.getparams = PathToJson(window.location.search);

        this.auth = this.auth.bind(this);
        this.onChange = this.onChange.bind(this);
        this.onShoise = this.onShoise.bind(this);
        this.logINasGues = this.logINasGues.bind(this);
        this.logINoldAccount = this.logINoldAccount.bind(this);
        this.getUserNomber = this.getUserNomber.bind(this);
        this.generateProfil = this.generateProfil.bind(this);
        this.uploadcountry = this.uploadcountry.bind(this);
        this.closeToast = this.closeToast.bind(this);
        this.userdeal = this.userdeal.bind(this);


    }

    componentWillMount() {
        if (Cookies.get("codewait") == "true") {
            this.setState({
                actPanel: "verficode"
            });
            Cookies.set("codewait", false);
        }

        if (Cookies.get("ghash")) {
            this.state.guest = false;
        }
        if (Cookies.get("tg_auth")) {
            this.state.tg_auth = JSON.parse(Cookies.get("tg_auth"));
        }
    }

    componentDidMount() {
        var main = this;
        main.baseOnpopstate(main);
    }

    baseOnpopstate(main) {


        window.onpopstate = function (e) {
            window.history.pushState(null, null, window.location.href);
            if(main.state.generation>0){
                main.showtoast("Дождитесь синхронизации постов");
                return;
            }

            if (main.state.actPanel != "telauth") {
                main.setState({actPanel: "telauth"});
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
                            style: "destructive"
                        }]}
                        onClose={() => {
                            main.setState({popout: null});
                        }}
                    >
                        <h2>Подтвердите действие</h2>
                        <p>Вы действительно хотите выйти?</p>
                    </Alert>
            });
            return false;

        };
    }

    closeToast() {
        this.state.toast -= 1;
    }

    showtoast(text, type, autoClose = 2000) {
        var closeToast = this.closeToast;
        var ntoast = this.state.toast;
        if (ntoast > 0) {
            return;
        }
        this.state.toast += 1;

        toast.info(text, {
            position: toast.POSITION.TOP_CENTER,
            type: type,
            hideProgressBar: autoClose === 2000,
            closeOnClick: false,
            draggable: false,
            onClose: closeToast,
            className: this.android ? "toast_android" : "toast_iphone",
            autoClose: autoClose
        })
    }

    onChange(e) {
        var v = e.target.value;
        if(e.target.name==="phone" || e.target.name==="code"){
            var re1=/[^+\d]+/;
            v=v.replace(re1,"");
        }
        this.setState({[e.target.name]: v})
    }

    onShoise(name) {
        var user_info = this.state.user_info;
        user_info[name] = user_info[name] ^ 1;
        console.log(user_info);
        this.setState({user_info: user_info})
    }

    getUserNomber() {
        var main = this;

        if (this.cond.phonewasget) {
            if (main.state.phone === "")
                main.setState({phone: main.state.phoneprefix});
            return;
        }
        this.cond.phonewasget = true;


        connect.send("VKWebAppGetPhoneNumber", {}).then((data) => {
            if (data["type"] === "VKWebAppGetPhoneNumberResult") {
                main.setState({phone: "+" + data["data"]["phone_number"]});
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
                    popout: null
                });
                return 0;
            }
            var phone = main.state.phone ? main.state.phone : "+7";
            phone = phone.replace(/\s+/g, "");
            console.log(phone);

            this.httpClient.get(HOST + '/auth/', {
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
                            iser: 0,
                        });
                        Cookies.set("hash", res['session']);
                        Cookies.set("guest", false);
                        Cookies.set("codewait", true);
                    } else if (res['status'] === "valid") {
                        main.setState({
                            errortext: ALERT_AUTH_CANSEL_YOUR_SESSION,
                            iser: true,
                            popout: null

                        });
                    } else if (res["status"] === "Вы пытались зарегистрироваться недавно, повторите минут через 20") {
                        main.setState({
                            popout: null,
                            actPanel: "verficode",
                            errortext2: "Вы пытались авторизоваться недавно, введите отправленный ранее код",
                            iser2: 1
                        });
                    } else {
                        main.setState({
                            errortext: res['status'],
                            iser: true,
                            popout: null

                        });
                    }
                })
                .catch(function (error) {
                    main.setState({
                        errortext: "Сервер не отвечает",
                        iser: true,
                        popout: null

                    });
                });
        }
        if (this.state.actPanel === "new_guest") {
            var nul = true;
            for (var u in this.state.user_info) {
                if (this.state.user_info[u] === 1)
                    nul = false;
            }
            if (nul) {
                this.showtoast("Выберите хотя бы одну категорию", toast.TYPE.ERROR);
                this.setState({popout: null});
                return;
            }
            //Отключим кнопку назад.
            window.onpopstate = function (e) {
                window.history.pushState(null, null, window.location.href);
            };
            this.httpClient.post(HEAD_HOST + '/auth/', {
                page: 3,
                settings: this.state.user_info
            })
                .then(function (response) {
                    // response = (response.data);
                    var res = response.data;
                    console.log(res);

                    if (res['status'] === 'ok') {
                        main.setState({
                            //popout: null,
                            iser: 0
                        });
                        axios.post(STATISTOC_HOST+"/new_tg_user/",
                            {phone:main.state.phone,
                                session:Cookies.get("hash"),
                                auth:false,
                                ...main.getparams
                            });
                        Cookies.set("hash", res['session']);
                        Cookies.set("ghash", res['session']);
                        main.enter();
                        setTimeout(() => {
                                main.props.main.setState({activeStory: "base"});
                            },
                            3000);

                    } else {
                        main.setState({
                            popout: null,
                        });
                        main.showtoast(res['status'], toast.TYPE.ERROR);
                    }

                }).catch(function (error) {
                main.showtoast("Сервер не отвечает", toast.TYPE.ERROR);
                main.setState({
                    popout: null
                });
                //Активируем кнопку назад
                main.baseOnpopstate(main)
            });
        }
        if (this.state.actPanel === "verficode") {
            this.setState({
                popout: <ScreenSpinner/>,
            });

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
                            iser: 0,
                            iser2: 0
                        });
                        main.showtoast("Началась синхронизация постов", toast.TYPE.INFO);

                        axios.post(STATISTOC_HOST+"/new_tg_user/",
                            {phone:main.state.phone,
                                session:Cookies.get("hash"),
                                auth:true,
                                ...main.getparams
                        });

                        main.enter();
                        Cookies.set("codewait", false);
                        //info
                        Cookies.set("tg_auth", JSON.stringify({
                            hash: Cookies.get("hash"),
                            phone: main.state.phone
                        }));
                        setTimeout(() => {
                                main.props.main.setState({activeStory: "base"});
                            },
                            29500);
                        setInterval(() => {
                                main.setState({generation: Math.min(main.state.generation + 0.34, 99)})
                            }, 100
                        )

                    } else {
                        main.setState({
                            popout: null,
                            errortext2: res['status'],
                            iser2: true
                        });
                        // main.showtoast(res['status'], toast.TYPE.WARNING,4000);
                    }

                }).catch(function (error) {
                main.showtoast("Сервер не отвечает", toast.TYPE.ERROR);
                main.setState({
                    popout: null
                });
            });
        }

    }

    enter() {
        if (Cookies.get("new_rds") !== "false") {
            Cookies.set("new_rds", "true");
            Cookies.set("new_set", "true");
        }
        Cookies.set("auth", "ok");
    }

    logINasGues(e) {

        this.enter();
        this.state.user_info = {};
        if (Cookies.get("ghash")) {
            Cookies.set("hash", Cookies.get("ghash"));
        } else {
            Cookies.set("hash", GUEST_HESH);
        }
        this.props.main.setState({activeStory: "base"});
    }

    logINoldAccount(e) {
        this.enter();
        Cookies.set("hash", this.state.tg_auth.hash);
        this.props.main.setState({activeStory: "base"});
    }

    generateProfil() {
        this.setState({actPanel: "new_guest"});
    }

    uploadcountry(e) {
        var val = e.target.value;
        var phone = "+";
        for (var c in COUNTRIES) {
            if (COUNTRIES[c].co === val) {
                phone += COUNTRIES[c].ph;
                break;
            }
        }
        this.setState({
            "phone": phone,
            "phoneprefix": phone,
            "country": e.target.value
        });

    }

    userdeal() {
        this.setState({actPanel: "userdeal"});
    }


    render() {
        var main = this;

        return (<View popout={this.state.popout} id={this.state.id} activePanel={this.state.actPanel}>
            <Panel id={"telauth"}>
                <PanelHeader>Авторизация</PanelHeader>
                <FormLayout status={1}>
                    {(this.state.iser) &&
                    <FormStatus title={this.state.errortitle} state="error">
                        {this.state.errortext}
                    </FormStatus>
                    }
                    <FormLayoutGroup top="Выберите страну">
                        <Select defaultValue={this.state.country} onChange={this.uploadcountry}>
                            {
                                COUNTRIES.map((country) => {
                                    return (
                                        <option name={country.ph} value={country.co}>{country.na.substr(0, 30)}</option>
                                    )
                                })
                            }
                        </Select>
                    </FormLayoutGroup>
                    <FormLayoutGroup top="Введите Ваш номер телефона">
                        <Input status={"default"} onChange={this.onChange} name={"phone"}
                               type="tel"
                               autocorrect="off"
                               autocomplete="tel"
                               maxLength="13"
                               value={this.state.phone} onClick={this.getUserNomber}/>
                        <Button disabled={this.state.consent<1 || this.state.phone.length<12} size="xl" onClick={this.auth}>Далее</Button>
                    </FormLayoutGroup>
                    <Checkbox checked={this.state.consent} onClick={(e) => {

                        if (this.cbox) {
                            this.cbox = false;
                            return false;
                        }
                        this.setState({consent: this.state.consent ^= 1});
                    }}>Я принимаю условия <Link onClick={() => {
                        this.cbox = true;
                        this.userdeal();
                    }}>пользовательского соглашения</Link> </Checkbox>
                </FormLayout>
                <Group title="Другие способы входа">
                    {(this.state.guest && !this.state.tg_auth) &&
                    <CellButton size="m" onClick={this.logINasGues}>Войти как гость</CellButton>}
                    {this.state.guest &&
                    <CellButton size="m" onClick={this.generateProfil}>Сгенерировать профиль</CellButton>}
                    {!this.state.guest &&
                    <CellButton size="m" onClick={this.logINasGues}>Войти в сгенерированый профиль</CellButton>}
                    {this.state.tg_auth && <CellButton size="m" onClick={this.logINoldAccount}>Войти в
                        telegram {this.state.tg_auth.phone}</CellButton>}
                </Group>
            </Panel>
            <Panel id={"verficode"}>
                <FixedLayout>
                    <div>
                    <ToastContainer/>
                    </div>
                </FixedLayout>
                <PanelHeader left={<HeaderButton onClick={() => {
                    if(main.state.generation>0){
                        main.showtoast("Дождитесь сонхронизации постов");
                        return;
                    }
                    this.setState({actPanel: "telauth"});
                }}><Icon24Back/></HeaderButton>}>Ваш код</PanelHeader>

                {this.state.generation > 0 &&
                <Div>
                    <InfoRow title={"Синхронизация постов: " + Math.floor(this.state.generation) + "%"}>
                        <Progress value={this.state.generation}/>
                    </InfoRow>
                </Div>
                }
                <FormLayout>
                    {(this.state.iser2) &&
                    <FormStatus title={this.state.errortitle2} state="error">
                        {this.state.errortext2}
                    </FormStatus>
                    }
                    <FormLayoutGroup top="Введите код подтверждения из Telegram" bottom={ALERT_AUTH_TEXT}>
                        <Input maxLength="5" type="tel" onChange={this.onChange} value={this.state.code} name={"code"}
                               placeholder={"Код подтверждения"}/>
                        <Button disabled={(this.state.generation > 0 || this.state.code.length < 5)} onClick={this.auth}
                                size="xl">Войти</Button>
                    </FormLayoutGroup>

                </FormLayout>
            </Panel>
            <Panel id={"userdeal"}>
                <PanelHeader left={<HeaderButton onClick={() => {
                    this.setState({actPanel: "telauth"})
                }}><Icon24Back/></HeaderButton>}>Пользовательское соглашение</PanelHeader>
                <Div><p className={"noselect constant_text"} dangerouslySetInnerHTML={{__html: USERDEAL}}>
                </p>
                </Div>
            </Panel>
            <Panel id={"new_guest"}>
                <PanelHeader left={<HeaderButton onClick={() => {
                    this.setState({actPanel: "telauth"})
                }}><Icon24Back/></HeaderButton>}>Генерация профиля</PanelHeader>
                <ToastContainer/>
                <Group top={"Что тебе интересно?"}>
                    <List>{
                        Array.prototype.map.call(GROUP_TYPES, function (gt, i) {
                            return (
                                <Cell selectable={true} onClick={() => {
                                    main.onShoise(gt.value)
                                }}>{gt.name}</Cell>
                            );
                        })
                    }
                    </List>

                    <Div>
                        <Button level={"secondary"} before={<Icon24Flash/>} onClick={this.auth} size="xl">Сгенерировать
                            профиль</Button>
                    </Div>
                </Group>
            </Panel>
        </View>)
    }
}