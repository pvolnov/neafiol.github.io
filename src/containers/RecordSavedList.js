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
    PanelHeaderContent,
    ScreenSpinner,
    View
} from '@vkontakte/vkui';
import Icon24Delete from '@vkontakte/icons/dist/24/delete';
import Icon16Dropdown from '@vkontakte/icons/dist/16/dropdown';
import connect from "@vkontakte/vkui-connect-promise";

export default class RecordSavedList extends React.Component {
    constructor(props) {
        super(props);
        this.store = props.store;
        this.dispatch = props.dispatch;

        // localStorage.setItem("savedR","");
        try {
            var m = JSON.parse(localStorage.getItem("savedR"));
            this.dispatch({type: 'SET_SAVED_MENU', data: m});

        } catch (e) {
            var m = [];
            localStorage.setItem("listsavedR", "");
            localStorage.setItem("savedR", "");
        }


        this.state = {
            actPanel: "savedlist",//active panel
            id: props.id,//view id
            menu: m,
            popuot: null,
            contextOpened: false
        };
        this.state.empty_nemu = this.state.menu && this.state.menu.length;

        // this.clearAll();
        this.clearAll = this.clearAll.bind(this);
        this.deletePost = this.deletePost.bind(this);
        this.toggleContext = this.toggleContext.bind(this);

    }

    componentWillMount() {
        var main = this;


    }
    componentDidMount() {
        var main = this;
        window.scrollTo( 0, this.store.y  );

        window.onpopstate = function(e) {
            window.history.pushState({page: 1}, "save", "");
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
        window.onscroll = () => {
            var posTop = (window.pageYOffset !== undefined) ? window.pageYOffset : (document.documentElement).scrollTop;
            main.dispatch({type: 'SET_SAVED_Y', data: posTop});
        };

        this.android= !['iPad', 'iPhone', 'iPod'].indexOf(navigator.platform) >= 0;
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
                            localStorage.setItem("savedR", "");
                            localStorage.setItem("listsavedR", "");
                            main.setState({
                                menu: [],
                                contextOpened: false,
                                empty_nemu: 0
                            })
                        },
                        autoclose: true,
                        style:"destructive"

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
            //Create the parent and add the children
            const FancyButton = React.forwardRef((props, ref) => (
                <button ref={ref} className="FancyButton">
                    {props.children}
                </button>
            ));

            rlist.push(
                <div key={i} role={"StatisticInfo"} identy={item['post_id']} type={item['type'] || 0}>
                    <Record
                        saved={true}
                        parents={main}
                        state={item}
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
                        <PanelHeaderContent aside={(this.state.empty_nemu > 0) && <Icon16Dropdown/>}
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