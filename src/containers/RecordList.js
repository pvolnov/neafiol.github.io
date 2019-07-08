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
    FixedLayout,
    PanelHeader,
    HeaderButton,
    PullToRefresh,
    ScreenSpinner,
    Tooltip,
    View, platform
} from '@vkontakte/vkui';
import { List, AutoSizer, CellMeasurer, CellMeasurerCache } from "react-virtualized";

import Cookies from "js-cookie";
import {HEAD_HOST, HOST, STATISTOC_HOST} from '../constants/config'
import connect from '@vkontakte/vkui-connect';
import {toast, ToastContainer} from "react-toastify";
import Icon24Back from '@vkontakte/icons/dist/24/back';
import Icon28ChevronBack from '@vkontakte/icons/dist/28/chevron_back';
import {IOS} from "@vkontakte/vkui/src/lib/platform";
import {osize, showtoast} from "../function";


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
            tmenu:[],
            filter:"",
            poput: null,
            fetching: false,
            isuploading: true,
            toast: 0,
            stopupload: false,
            offline: false,
            fullphoto: {url: ""}
        };

        this.uploadnews = this.uploadnews.bind(this);
        this.getstatistic = this.getstatistic.bind(this);
        this.createRecords = this.createRecords.bind(this);
        this.renderRow = this.renderRow.bind(this);
        this.updatemarking = this.updatemarking.bind(this);
        this.showtoast = showtoast.bind(this);
        this.closeToast = this.closeToast.bind(this);
        this.refresh = this.refresh.bind(this);
        this.offline = this.offline.bind(this);
        this.addfilter = this.addfilter.bind(this);

        this.cond = {
            isnew: true,
            allTpost:false
        };
        this.cache = new CellMeasurerCache ({
            fixedWidth: true,
            defaultHeight: 100
        });
        this.listRef=[];
        this.android = platform() == "android";
    }


    updatemarking() {
        console.log("update");
        // this.cache.clearAll();
        // this._list.recomputeRowHeights();
    }


    componentDidUpdate(prevProps, prevState, snapshot) {
        // this.updatemarking();
    }


    componentWillMount() {
        if (Cookies.get("Setting") != null)
            this.setting = JSON.parse(Cookies.get("Setting"));
        else {
            this.setting = {};
        }

        var main = this;
        setTimeout(() => {
            window.scrollTo(0, main.store.y);
            // main.listRef.current.scrollToItem(main.store.y);
        }, 0);

        console.log("RECORD LIST");
        if (this.store.list)
            if (osize(this.store.list) < 2) {
                this.uploadnews(-1);
                setTimeout(this.getstatistic, 2000, [], 0);
            } else {
                this.setState({
                    isuploading: false,
                    menu: this.store.list
                });
            }

        var main = this;

        window.onscroll = () => {

            var posTop = (window.pageYOffset !== undefined) ? window.pageYOffset : (document.documentElement).scrollTop;
            main.dispatch({type: 'SET_MAIN_Y', data: posTop});

            if (document.documentElement.scrollHeight - posTop < 3000) {
                if (!main.state.stopupload && !main.state.isuploading) {
                    main.uploadnews(1);
                }
            }
        };
        this.baseOnpopstate(main);
        window.history.pushState(null, null, window.location.href);

    }


    componentDidMount() {
    }


    refresh() {
        if (window.navigator.onLine) {
            window.location.reload();
            return;
        } else {
            this.showtoast("Нет связи с сервером");
            return;
        }
        var main = this;
        this.dispatch({"type": "CLEAR"});
        this.setState({
            menu: [],
            fetching: true
        });
        setTimeout(() => {
            main.setState({
                fetching: false
            });
        }, 3500);
        this.uploadnews(-1);
    }


    baseOnpopstate(main) {
        window.onpopstate = (e) => {
            window.history.pushState(null, null, window.location.href);
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


    offline() {
        if (this.state.offline) {
            return;
        }
        this.setState({offline: true});
        // this.showtoast("Сервер не отвечает",toast.TYPE.ERROR);
    }


    getstatistic(mas, n) {
        let delaytime = 450;
        var centerX = document.documentElement.clientWidth / 2;
        var centerY = document.documentElement.clientHeight / 3;

        var elem = document.elementFromPoint(centerX, centerY);
        while (elem.parentNode.tagName) {

            try {
                if (elem.attributes['identy'] != null) {
                    let ident = elem.attributes['identy'].value;
                    // let index = elem.attributes['index'].value;
                    // this.dispatch({type:"SET_MAIN_Y",data:index});
                    var isinmas = false;
                    for (var i = 0; i < mas.length; i++) {
                        if (mas[i]['id'] === ident) {
                            mas[i].time += delaytime;
                            isinmas = true;
                            break;
                        }
                    }
                    if (!isinmas)
                        mas.push({'type': 'vkrecord', id: ident, posttype: "0", time: delaytime});
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
                    console.log("sent error");
                }
            ).then(() => {
                console.log("sent stat");
            });

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

    //spesial request that get some recirds from server
    uploadnews(type = 0) {
        var main = this;
        if(this.state.tematic){
            if(this.cond.allTpost){
                return;
            }
            var post_now = osize(this.state.menu);

            this.httpClient.post(HEAD_HOST + '/get/', {
                    amount:30,
                    groupid:main.state.filter,//-12323431
                    type: 4,
                    post_now: post_now,//13
                    session: Cookies.get('hash'),//cc97w6f8rtf6rgf97gr9ft9rf
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
                if(osize(res['posts'])<1){
                    main.cond.allTpost=true;
                    return;
                }

                var new_posts = main.state.tmenu;
                new_posts = new_posts.concat(res['posts']);
                main.dispatch({type: 'UPDATE_RECORD_TEMATIC_LIST', data: new_posts.slice()});

                main.setState({
                    tmanu:new_posts
                });

            }).catch(function (error) {
                console.log("Error");
                main.offline();
                main.setState({
                    fetching: false,
                    popout: null,
                    isuploading: false,
                    gloabaluploading: false

                });
                //end of uploading
                // setTimeout(main.uploadnews,2000);
                setTimeout(() => {
                    main.setState({gloabaluploading: false});


                }, 2000);
            });
            return;
        }


        var post_now = osize(this.state.menu);

        // console.log("AUTAPLOAD ", type);
        this.setState({
            isuploading: true,
            fetching: false
        });

        switch (type) {
            case 0: {
                if (main.state.gloabaluploading) {
                    break;
                }

                var count = 150;
                post_now = osize(this.store.full_list);
                main.setState({gloabaluploading: true});


                this.httpClient.post(HEAD_HOST + '/get/', {
                        amount: count,
                        type: 2,
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
                    if (osize(res['posts']) < 149) {
                        main.setState({
                            stopupload: true
                        });
                    }
                    // console.log(res['posts']);
                    var new_posts = main.store.full_list;
                    new_posts = new_posts.concat(res['posts']);
                    main.dispatch({type: 'UPDATE_RECORD_LIST', data: new_posts.slice()});
                    setTimeout(() => {
                        main.setState({
                            gloabaluploading: false,
                            isuploading: false
                        });
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
                        gloabaluploading: false

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
                if (osize(full_list) < 10)
                    break;

                for (var i = post_now; i < post_now + 15; i++) {
                    var p = full_list[i];
                    this.state.menu.push(p)
                }
                this.forceUpdate();
                this.dispatch({type: 'RECORDS_UPDATE', data: this.state.menu.slice()});

                if (osize(full_list) - 30 < osize(this.state.menu)) {
                    this.uploadnews(0)
                }
                this.setState({
                    popout: null,
                    // fetching: false
                });
                break;
            }
            case -1: {

                this.setState({
                    popout: <ScreenSpinner/>,
                    fetching: false
                });
                var ctype = this.setting.clevernewsline ? 0 : -1;
                this.httpClient.post(HEAD_HOST + '/get/', {
                        amount: 15,
                        type: ctype,
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
                    if (osize(resp.data.posts) === 0) {
                        main.setState({
                            isuploading: false,
                            gloabaluploading: false
                        })
                    }
                    main.uploadnews();
                    main.dispatch({type: 'RECORDS_UPDATE', data: resp.data.posts.slice()});
                    main.dispatch({type: 'UPDATE_RECORD_LIST', data: resp.data.posts.slice()});
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


    }


    addfilter(filter,gname){
        filter = filter.split("__")[0];
        console.log("filtler",filter);
        var nlist=[];
        for (var p in this.store.full_list){
            let post = this.store.full_list[p];
            if(post.post_id.split("__")[0]===filter){
                nlist.push(post)
            }
        }

        this.setState({
            tmenu:nlist,
            actPanel:"tematic",
            gname:gname,
            filter:filter
        });
        var main = this;
        window.onpopstate = (e) => {
            window.history.pushState(null, null, window.location.href);
            main.setState({actPanel:"main"});
            main.baseOnpopstate(main);
        }
    }


    getRecordSize(index){
            return 50;
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
                        <div
                            key={i}
                            role={"StatisticInfo"}
                            identy={item['post_id']}>
                            <Record
                                parent={main}
                                dispatch={main.dispatch}
                                setting={this.setting}
                                record={item}/>
                        </div >
                    );
            } catch (e) {
                console.log("Error write post")
            }
        }
        return rlist;
    };


    renderRow({ index, key, style, parent }) {
        // console.log(parent);
        var item = this.state.menu[index];
        var main = this;
        var ref = React.createRef();
        this.listRef.push(ref);

        return (
            <CellMeasurer
                parent={parent}
                cache={this.cache}
                key={key}
                rowIndex={index}
                columnIndex={0}
                role={"StatisticInfo"}
                identy={item['post_id']}
                >
                <div
                    style={style}
                    index={index}
                    role={"StatisticInfo"}
                    identy={item['post_id']}>
                <Record
                    ref={this.ref}
                    parent={main}
                    dispatch={main.dispatch}
                    setting={this.setting}
                    record={item}/>
                </div>
            </CellMeasurer >
        );
    }


    _setListRef = ref => {
        console.log("REF");
        this._list = ref;
    };


    render() {
        return (
            <View id={this.state.id} popout={this.state.popout} activePanel={this.state.actPanel}>
                <Panel id="main">
                    <PanelHeader>Новости</PanelHeader>
                    <FixedLayout>
                        <div>
                            <ToastContainer/>
                        </div>
                    </FixedLayout>
                    {/*<AutoSizer>*/}
                        {/*{*/}
                            {/*({ width, height }) => {*/}
                                {/*return <List*/}
                                    {/*ref={this._setListRef}*/}
                                    {/*width={width}*/}
                                    {/*height={height}*/}
                                    {/*deferredMeasurementCache={this.cache}*/}
                                    {/*rowHeight={this.cache.rowHeight}*/}
                                    {/*rowRenderer={this.renderRow}*/}
                                    {/*rowCount={this.state.menu.length}*/}
                                    {/*overscanRowCount={10} />*/}
                            {/*}*/}
                        {/*}*/}
                    {/*</AutoSizer>*/}

                    <PullToRefresh onRefresh={this.refresh} isFetching={this.state.fetching}>
                        <React.Fragment>
                            {this.state.menu &&
                            this.createRecords(this.state.menu)}
                        </React.Fragment>
                    </PullToRefresh>


                    { this.state.offline ?
                        <Footer>Нет связи с сервером</Footer> :
                        (this.state.isuploading || this.state.gloabaluploading) ?

                            (
                                (!this.state.isuploading || osize(this.state.menu) > 0) &&
                                <Footer>Загрузка...</Footer>
                            )

                            :
                            (

                                (osize(this.state.menu) === 0) ?
                                    <Footer>У Вас нет групп</Footer>
                                    :
                                    this.state.stopupload && <Footer>Постов больше нет</Footer>
                            )


                    }
                </Panel>
                <Panel id="tematic">
                    <PanelHeader
                        left={<HeaderButton onClick={()=> this.setState({actPanel:"main"})}>
                            {this.android ?<Icon24Back/>: <Icon28ChevronBack/>  }</HeaderButton>} >{this.state.gname}</PanelHeader>
                    <FixedLayout>
                        <div>
                            <ToastContainer/>
                        </div>
                    </FixedLayout>

                    <React.Fragment>
                        {this.state.tmenu &&
                        this.createRecords(this.state.tmenu)}
                    </React.Fragment>

                </Panel>
            </View>
        )
    }
}
