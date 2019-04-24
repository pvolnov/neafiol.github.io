import React from "react";
import Record from "../components/Record";
import {CellButton,Footer,Div,Cell,List,HeaderContext,PanelHeaderContent,HeaderButton, Group, Panel, PanelHeader, ScreenSpinner, View} from '@vkontakte/vkui';
import Icon36Delete from '@vkontakte/icons/dist/36/delete';
import Icon24Delete from '@vkontakte/icons/dist/24/delete';
import Icon16Dropdown from '@vkontakte/icons/dist/16/dropdown';

export default class RecordSavedList extends React.Component {
    constructor(props) {
        super(props);
        this.store = props.store;
        this.dispatch = props.dispatch;

        // localStorage.setItem("savedR","");
        try {
            var m =JSON.parse(localStorage.getItem("savedR"));
            this.dispatch({ type: 'SET_SAVED_MENU',data:m });

        }
        catch (e) {
            var m =[];
            localStorage.setItem("listsavedR","");
            localStorage.setItem("savedR","");
        }


        this.state={
            actPanel:"savedlist",//active panel
            id:props.id,//view id
            menu:m,
            popuot:null,
            contextOpened: false
        };
        this.state.empty_nemu = this.state.menu && this.state.menu.length;

        // this.clearAll();
        this.clearAll=this.clearAll.bind(this);
        this.deletePost=this.deletePost.bind(this);
        this.toggleContext = this.toggleContext.bind(this);

    }
    componentWillUpdate(nextProps, nextState, nextContext) {
        console.log("RECORD LIST UPDATE");
    }

    componentWillMount() {

        document.documentElement.scrollTop=this.store.y;
        var main = this;
        window.onscroll=()=>{
            var posTop = (window.pageYOffset !== undefined) ? window.pageYOffset : (document.documentElement ).scrollTop;
            main.dispatch({ type: 'SET_SAVED_Y',data:posTop });
        };

    }

    clearAll(e){
        localStorage.setItem("savedR","");
        localStorage.setItem("listsavedR","");
        this.setState({
            menu:[],
            contextOpened: false,
            empty_nemu:0
        })
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
                <div key={i} role={"StatisticInfo"} identy = {item['post_id']} type={item['type']||0}>
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

    toggleContext () {
        this.setState({ contextOpened: !this.state.contextOpened });
    }
    deletePost(){
        console.log("delete_post");
        this.setState({empty_nemu:this.state.empty_nemu-1});
    }

    render() {
        //upload our records
        var main = this;
        return (
            <View id={this.state.id}  popout={this.state.popout} activePanel={this.state.actPanel}>
                <Panel id="savedlist">
                    <PanelHeader  >
                        <PanelHeaderContent aside={(this.state.empty_nemu>0) &&<Icon16Dropdown />} onClick={this.toggleContext}>
                            Сохраненные посты
                        </PanelHeaderContent>
                    </PanelHeader>
                    {(this.state.empty_nemu>0) &&
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

                    {this.state.menu&&
                    this.createRecords(this.state.menu)}

                    {
                        (this.state.empty_nemu<1)&&(
                            <Footer>У Вас пока нет сохраненных постов</Footer>
                        )
                    }

                </Panel>
            </View>
        )
    }
}