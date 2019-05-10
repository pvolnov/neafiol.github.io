import React from "react";
import axios from "axios";
import {WidgetRecord} from "../components";
import {CellButton,Alert, Group, Panel, PanelHeader, ScreenSpinner, View} from '@vkontakte/vkui';
import {HOST, STATISTOC_HOST} from '../constants/config'
import Cookies from "js-cookie";
import * as offline from '../constants/offline'
import {ALERT_NOT_CONNECT_TEXT,ALERT_NOT_CONNECT_TITLE} from '../constants/TextConstants'


export default class WidgetRecordList extends React.Component {

    constructor(props) {
        super(props);
        this.store = props.store;
        this.dispatch = props.dispatch;

        this.httpClient = axios.create();
        this.httpClient.defaults.timeout = 3500;


        this.state={
            actPanel:"listofwr",//active panel
            id:props.id,//view id
            recordcount:20,//how mach Records we need load now
            menu:null,//list of our records
            poput:null,
            connection:true
        };
        this.uploadnews = this.uploadnews.bind(this);
        this.closePopout = this.closePopout.bind(this);
        this.checkserver = this.checkserver.bind(this);

    }
    componentDidMount() {
        //--------------INIT---------------
        this.checkserver();
        if(this.store.list.length<3)
            this.uploadnews();
        else {
            this.setState({
                menu:this.store.list
            });
        }
        // setTimeout(this.getstatistic,2000,[],0);
        //-------------------INIT--------------
    }

    checkserver(){
        var main = this;
        this.httpClient.get("https://telegram.org/").catch(
            (e) => {
                if(e.message.indexOf("timeout")!=-1) {
                    main.setState({
                        popout:
                            <Alert
                                actionsLayout="vertical"
                                actions={[{
                                    title: 'Отмена',
                                    autoclose: true,
                                    style: 'destructive'
                                }]}
                                onClose={main.closePopout}
                            >
                                <h2>{ALERT_NOT_CONNECT_TITLE}</h2>
                                <p>{ALERT_NOT_CONNECT_TEXT}</p>
                            </Alert>
                    });
                    main.setState({connection: false});
                }
            }
        );
    }

    closePopout () {
        this.setState({ popout: null ,connection: true});
    }

    //spesial request that get some recirds from server
    uploadnews(){
        this.setState({ popout: <ScreenSpinner /> });
        var main = this;
        //get list of our records
        axios.get(HOST + '/get_widgets/', {params:{
                amount:main.state.recordcount,
                session:Cookies.get('hash'),
                type : 0,
                post_now:0,
                get:1
            }})
            .then(function (response) {
                var res=response.data;
                main.setState({
                    popout: null,
                    recordcount:main.state.recordcount+10,
                    menu:res['widgets']
                });
                main.dispatch({ type: 'WIDGETS_UPDATE',data:res.widgets });
                if(main.state.connection){
                    main.setState({
                        popout: null,
                    });
                }


            })
            .catch(function (error) {
                console.log(error);
                //otherwise we will off our alert
                if(main.state.connection){
                    main.setState({
                        popout: null,
                    });
                }
                this.setState({
                    menu:offline.wrecords
                });
            });
    }

    render() {

        return (
            <View id={this.state.id}  popout={this.state.popout} activePanel={this.state.actPanel}>
                <Panel id="listofwr">
                    <PanelHeader>News</PanelHeader>
                    {this.state.menu&&
                    Array.prototype.map.call(this.state.menu, function (item, i) {
                        return (
                            <div identy = {item['post_id']} type={item['type']||0} >
                                <WidgetRecord key={i} data={item}/>
                                </div>
                        );
                    })
                    }
                    <Group>
                        <CellButton align="center" onClick={()=>{this.uploadnews();}}>
                            Load New
                        </CellButton>
                    </Group>
                </Panel>


            </View>
        )
    }
}