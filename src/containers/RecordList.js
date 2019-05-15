import React from "react";
import axios from "axios";
import Record from "../components/Record";
import {
    Alert,
    CellButton,
    Footer,
    Group,
    Panel,
    Div,
    PanelHeader,
    PullToRefresh,
    ScreenSpinner,
    Tooltip,
    View
} from '@vkontakte/vkui';
import Cookies from "js-cookie";
import {HEAD_HOST, HOST, STATISTOC_HOST} from '../constants/config'
import connect from '@vkontakte/vkui-connect';
import {toast, ToastContainer} from "react-toastify";
import {ping} from "../function";


export default class RecordList extends React.Component {
    constructor(props) {
        super(props);
        this.store = props.store;
        this.dispatch = props.dispatch;


        this.httpClient = axios.create();
        this.httpClient.defaults.timeout = 20000;

        this.state = {
            actPanel: "main",//active panel
            id: props.id,//view id
            menu: [],//list of our records
            poput: null,
            fetching: false,
            isuploading: true,
            toast:0,
            offline:false,
            fullphoto: {url: ""}
        };

        this.uploadnews = this.uploadnews.bind(this);
        this.getstatistic = this.getstatistic.bind(this);
        this.checkend = this.checkend.bind(this);
        this.createRecords = this.createRecords.bind(this);
        this.showtoast = this.showtoast.bind(this);
        this.closeToast = this.closeToast.bind(this);
        this.refresh = this.refresh.bind(this);
        this.offline = this.offline.bind(this);

        this.cond = {
            isnew: true
        };
        this.stopupload=false;

    }
    refresh(){
        var main = this;
        this.dispatch({"type":"CLEAR"});
        this.setState({
            menu:[],
            fetching:true
        });
        setTimeout(()=>{
            main.setState({
                fetching:false
            });
        },1500);
        this.uploadnews(-1);
    }

    componentWillMount() {
        if (this.store.list)
            if (this.store.list.length < 2) {
                this.uploadnews(-1);
                setTimeout(this.getstatistic, 2000, [], 0);
            } else {
                setTimeout(this.getstatistic, 2000, [], 0);
                this.setState({
                    isuploading:false,
                    menu: this.store.list
                });
            }

        //we can't sent too many data in our recuest:
    }

    componentDidMount() {


        var main = this;
        window.onscroll = () => {
            var posTop = (window.pageYOffset !== undefined) ? window.pageYOffset : (document.documentElement).scrollTop;
            main.dispatch({type: 'SET_MAIN_Y', data: posTop});
        };

        window.onpopstate = (e) => {
            window.history.pushState({page: 1}, "main", "");
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
        window.history.pushState({page: 1}, "main", "");
        this.android = !['iPad', 'iPhone', 'iPod'].indexOf(navigator.platform) >= 0;
        window.scrollTo(0, this.store.y );
    }

    closeToast() {
        this.state.toast -= 1;
    }
    offline(){
        if(this.state.offline){
            return;
        }
        this.setState({offline:true});
        // this.showtoast("Сервер не отвечает",toast.TYPE.ERROR);
    }

    showtoast(text, type, autoClose = 2000) {
        var closeToast = this.closeToast;
        var ntoast = this.state.toast;
        if (ntoast > 0) {
            return;
        }
        this.state.toast += 1;
        console.log(this.state.toast);
        toast.info(text, {
            position: toast.POSITION.TOP_CENTER,
            type: type,
            closeOnClick: false,
            hideProgressBar: true,
            draggable: false,
            onClose: closeToast,
            className: this.android ? "toast_android" : "toast_iphone",
            autoClose: autoClose
        })
    }

    getstatistic(mas, n) {
        let delaytime = 500;
        var centerX = document.documentElement.clientWidth / 2;
        var centerY = document.documentElement.clientHeight / 3;

        var elem = document.elementFromPoint(centerX, centerY);
        while (elem.parentNode.tagName) {

            try {
                if (elem.attributes['identy'] != null) {
                    let ident = elem.attributes['identy'].value;
                    let ident_key = Number(elem.attributes['identy_key'].value);
                    this.checkend(ident_key);
                    let type = elem.attributes['type'].value;
                    var isinmas = false;
                    for (var i = 0; i < mas.length; i++) {
                        if (mas[i]['id'] === ident) {
                            mas[i].time += delaytime;
                            isinmas = true;
                            break;
                        }
                    }
                    if (!isinmas)
                        mas.push({'type': 'vkrecord', id: ident, posttype: type, time: delaytime});
                    break;
                }
            } catch (e) {
                console.error(e);
            }
            elem = elem.parentNode;
        }

        if (n > 30 && mas.length > 0) {
            // console.log("message");
            var mas1 = mas;
            this.httpClient.post(STATISTOC_HOST + '/new_stat/', {
                    statistic: mas,
                    session: Cookies.get('hash'),
                },
            ).catch(() => {
                    //if we coudn't sent a recuest
                    mas = mas1;
                }
            );
            console.log("sent stat");
            var setting = {};
            if (Cookies.get("Setting") != null)
                setting = JSON.parse(Cookies.get("Setting"));
            setting.timeinapp = delaytime * 30 + (setting.timeinapp);
            for (var m in mas) {
                if (mas[m].time > 3000) {
                    setting.postshow = (setting.postshow | 0) + 1;

                }
            }
            Cookies.set("Setting", setting);
            mas = [];
            n = 0;
        }

        setTimeout(this.getstatistic, delaytime, mas, n + 1);
    }

    checkend(elem) {
        if (!this.state.menu) return;
        if (this.state.isuploading || this.state.menu.length < 5) {
            return;
        }

        var i = 0;
        var n = this.state.menu.length < 10 ? 6 : 9;
        // console.log(elem);

        if (elem > this.state.menu.length - n) {
            if(this.stopupload)return;
            console.log("UPLOAD ",this.state.menu.length,i);
            this.uploadnews(1);
        }


    }

    //spesial request that get some recirds from server
    uploadnews(type = 0) {

        var count = 0;
        var post_now = this.state.menu && this.state.menu.length;
        var f15 = false;
        if (type === -1) {
            f15 = true;
            type = 0;
        }
        var main = this;
        // console.log("AUTAPLOAD ", type);
        this.setState({
            isuploading: true,
            fetching:false
        });


        switch (type) {
            case 0: {
                if (main.state.gloabaluploading) {
                    break;
                }

                count = 150;
                post_now = this.store.full_list && this.store.full_list.length;
                main.setState({gloabaluploading: true});


                this.httpClient.post(HEAD_HOST + '/get/', {
                            amount: count,
                            type: type,
                            post_now: post_now,
                            session: Cookies.get('hash'),
                    }
                ).then((res) => {
                    if (res.data["status"] === "_wrong_session") {
                        Cookies.set("auth", "false");
                        Cookies.set("hash", "");
                        console.log("ERR");
                        window.location.reload();
                        return;
                    }
                    res = res.data;
                    if(res['posts'].length<149){
                        main.stopupload=true;
                    }
                    var new_posts = main.store.full_list;
                    new_posts = new_posts.concat(res['posts']);
                    main.dispatch({type: 'UPDATE_RECORD_LIST', data: new_posts.slice()});
                    setTimeout(() => {
                        main.setState({
                            gloabaluploading: false,
                            isuploading: false});
                    }, 2000);

                    main.setState({
                        fetching: false,
                        popout: null
                    });

                }).catch(function (error) {
                    console.log("Error");
                    main.offline();
                    main.setState({
                        fetching: false,
                        popout: null,
                        isuploading: false,
                        gloabaluploading:false

                    });
                    //end of uploading
                    // setTimeout(main.uploadnews,2000);
                    setTimeout(() => {
                        main.setState({gloabaluploading: false});


                    }, 2000);
                });
                break;
            }
            case 1: {


                setTimeout(() => {
                    main.setState({
                        isuploading: false
                    });

                }, 2000);

                var full_list = this.store.full_list;
                if (full_list.length < 10)
                    break;

                for (var i = post_now; i < post_now + 15; i++) {
                    var p = full_list[i];
                    this.state.menu.push(p)
                }
                this.forceUpdate();
                this.dispatch({type: 'RECORDS_UPDATE', data: this.state.menu.slice()});

                if (full_list.length - 30 < this.state.menu.length) {
                    this.uploadnews(0)
                }
                this.setState({
                    popout: null,
                    // fetching: false
                });
                break;
            }
        }

        if (f15) {

            this.setState({
                popout: <ScreenSpinner/>,
                fetching: false
            });
            this.httpClient.post(HEAD_HOST + '/get/', {
                        amount: 15,
                        type: -1,
                        post_now: 0,
                        session: Cookies.get('hash')
                }
            ).then((resp) => {
                if (resp.data.status !== "ok") {
                    main.showtoast(resp.data.status, toast.TYPE.ERROR)
                }
                // console.log(resp.data.posts)
                main.setState({
                    menu: resp.data.posts,
                    fetching: false,
                    popout: null
                });
                if(resp.data.posts.length==0){
                    main.setState({
                        isuploading:false,
                        gloabaluploading:false
                    })
                }
                main.dispatch({type: 'RECORDS_UPDATE', data: resp.data.posts.slice()});
            })
                .catch((e) => {
                main.setState({
                    fetching: false,
                    popout: null
                });
                    main.offline();

                })
        }


    }

    createRecords = (menu) => {
        let rlist = [];
        var main = this;        // Outer loop to create parent

        for (let i in menu) {
            let item = menu[i];
            //Create the parent and add the children
            // try {
            try {
                if (item)
                    rlist.push(
                        <div key={i} role={"StatisticInfo"} identy_key={i} identy={item['post_id']}
                             type={item['type'] || 0}>
                            <Record
                                parents={main}
                                dispatch={main.dispatch}
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
                        </div>
                    );
            } catch (e) {
                console.log("Error write post")
            }
        }
        return rlist;
    };

    render() {

        return (
            <View id={this.state.id} popout={this.state.popout} activePanel={this.state.actPanel}>
                <Panel id="main">
                    <PanelHeader>Новости</PanelHeader>
                    <ToastContainer/>
                    <PullToRefresh onRefresh={this.refresh} isFetching={this.state.fetching}>
                        {this.state.menu &&
                        this.createRecords(this.state.menu)}
                    </PullToRefresh>


                    {this.state.offline?
                        <Footer className={"noselect"}>Нет связи с сервером</Footer>:
                        (this.state.isuploading || this.state.gloabaluploading) ?

                            (
                                (!this.state.isuploading || this.state.menu && this.state.menu.length > 0) &&
                                <Footer className={"noselect"}>Загрузка...</Footer>
                            )

                            :
                            (

                                (this.state.menu && this.state.menu.length === 0) ?
                                    <Footer className={"noselect"}>У Вас нет групп</Footer>
                                    :
                                    <Footer className={"noselect"}>Постов больше нет</Footer>
                            )


                    }
                    <div/>


                </Panel>


            </View>
        )
    }
}
