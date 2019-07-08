import React from "react";
import Record from "../components/Record";
import {
    Alert,
    Cell,
    CellButton,
    Div,
    Footer,
    Group,
    HeaderButton,
    HeaderContext,
    List,
    Panel,
    PanelHeader,
    PanelHeaderContent, platform,
    ScreenSpinner,
    View
} from '@vkontakte/vkui';
import Icon24Delete from '@vkontakte/icons/dist/24/delete';
import Icon16Dropdown from '@vkontakte/icons/dist/16/dropdown';
import connect from "@vkontakte/vkui-connect-promise";
import {IOS} from "@vkontakte/vkui/src/lib/platform";
import Cookies from "js-cookie";
import {osize} from "../function";
import {HEAD_HOST, STATISTOC_HOST} from "../constants/config";
import axios from "axios";

export default class RecordSavedList extends React.Component {
    constructor(props) {
        super(props);
        this.store = props.store;
        this.dispatch = props.dispatch;


        this.state = {
            actPanel: "savedlist",//active panel
            id: props.id,//view id
            popuot: null,
            contextOpened: false
        };


        // this.clearAll();
        this.clearAll = this.clearAll.bind(this);
        this.deletePost = this.deletePost.bind(this);
        this.toggleContext = this.toggleContext.bind(this);

        this.android = platform() == "android";

    }

    componentWillMount() {
        this.setting = JSON.parse(Cookies.get("Setting"));
        // localStorage.setItem("savedR","");
    }

    componentDidCatch(error, errorInfo) {
        localStorage.clear();
        console.log("Error");
        window.location.reload();
    }

    componentDidMount() {
        var main = this;
        window.scrollTo(0, this.store.y);
        setTimeout(()=>window.scrollTo(0, this.store.y),1);
        window.onpopstate = function (e) {
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
        window.onscroll = () => {
            var posTop = (window.pageYOffset !== undefined) ? window.pageYOffset : (document.documentElement).scrollTop;
            // console.log(posTop);
            main.dispatch({type: 'SET_SAVED_Y', data: posTop});
        };

        if(osize(this.store.menu)>0){
            this.setState({
                menu: this.store.menu
            });
            return;
        }

        try {
            this.setState({
                popout: <ScreenSpinner/>,
            });

            var main = this;
            axios.post(STATISTOC_HOST + '/api/', {
                    request_name: "get_saved_posts",
                    params: {
                        session: Cookies.get('hash')
                    }
                }
            ).then((res) => {
                var m = res.data.posts;
                main.setState({
                    menu: m,
                    empty_nemu: osize(m),
                    popout: null
                });
                this.dispatch({type: 'SET_SAVED_MENU', data: m});
            }).catch((e) => console.log(e));

        } catch (e) {

            // this.b("Can't parse localstorage");
            localStorage.setItem("listsavedR", "[]");
            localStorage.setItem("savedR", "[]");
        }

    }

    clearAll(e) {
        var main = this;
        this.setState({
            popout:
                <Alert
                    actions={[{
                        title: 'Отмена',
                        autoclose: true,
                        style: 'cancel'
                    }, {
                        title: "Удалить",
                        action: () => {
                            localStorage.setItem("savedR", "[]");
                            localStorage.setItem("listsavedR", "[]");

                            axios.post(STATISTOC_HOST + "/raport/", {
                                session: Cookies.get("hash"),
                                info: {
                                    type: "unsavedall",
                                    data: "all"
                                }
                            });
                            this.dispatch({type: 'SET_SAVED_MENU', data: []});

                            main.setState({
                                menu: [],
                                contextOpened: false,
                                empty_nemu: 0
                            })
                        },
                        autoclose: true,
                        style: "destructive"

                    }]}
                    onClose={() => {
                        main.setState({popout: null});
                        main.setState({contextOpened: false});
                    }}
                >
                    <h2>Подтвердите действие</h2>
                    <p>Удалить все сохраненные посты?</p>
                </Alert>
        });

    }

    createRecords = (menu) => {
        let rlist = [];
        var main = this;
        // Outer loop to create parent

        for (let i in menu) {
            let item = menu[i];
            rlist.push(
                <div key={i} role={"StatisticInfo"} identy={item['post_id']} type={item['type'] || 0}>
                    <Record
                        saved={true}
                        parent={main}
                        record={item}
                        setting={this.setting}
                    />
                </div>
            );


        }
        return rlist;
    };

    toggleContext() {
        this.setState({contextOpened: !this.state.contextOpened});
    }

    deletePost() {
        this.state.empty_nemu -= 1;
        this.forceUpdate();

    }

    render() {
        //upload our records
        var main = this;
        return (
            <View id={this.state.id} popout={this.state.popout} activePanel={this.state.actPanel}>
                <Panel id="savedlist">
                    <PanelHeader>
                        <PanelHeaderContent disabled={this.state.empty_nemu < 1}
                                            aside={(this.state.empty_nemu > 0) && <Icon16Dropdown/>}
                                            onClick={this.toggleContext}>
                            Сохраненные посты
                        </PanelHeaderContent>
                    </PanelHeader>
                    {(this.state.empty_nemu > 0) &&
                    <HeaderContext opened={this.state.contextOpened} onClose={this.toggleContext}>
                        <List>
                            <CellButton
                                before={<Icon24Delete/>}
                                level="danger"
                                onClick={this.clearAll}>
                                Удалить все
                            </CellButton>
                        </List>
                    </HeaderContext>
                    }

                    {this.state.menu &&
                    this.createRecords(this.state.menu)}

                    {
                        (this.state.empty_nemu < 1) && (
                            <Footer>У Вас пока нет сохраненных постов</Footer>
                        )
                    }

                </Panel>
            </View>
        )
    }
}