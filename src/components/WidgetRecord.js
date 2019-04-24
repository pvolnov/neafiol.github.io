import React from 'react';
import { View, Panel, Alert,PanelHeader,ScreenSpinner, Tooltip,Avatar, Group, List, Cell,CellButton,HeaderButton,TabbarItem,Tabbar,Epic,Div,Button} from '@vkontakte/vkui';


export default class WidgetRecord extends React.Component {
    constructor(props) {
        super(props);
        var content = props.data.text;
        if(content.indexOf("Post not found")+1){
            content="";
        }
        this.state={
            content:content,
            id:props.data.id,
        };
    }

    render() {
        //wi render post from telegramm official widget

        return (
            <React.Fragment>
                {this.state.content && (<div style={{"margin-bottom":"-18px"}}>
                    <div style={{"padding": "4%"}}>
                        <div dangerouslySetInnerHTML={{__html: (this.state.content)}}></div>
                    </div>
                </div>)
                }
            </React.Fragment>);
    }

}


