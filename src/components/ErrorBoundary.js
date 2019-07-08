
import React from 'react';
import axios from "axios";
import Cookies from "js-cookie";
import {STATISTOC_HOST} from '../constants/config'
import {CellButton, Panel} from "./OnePost";

export  class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false ,
            info:props.info
        };

    }

    componentDidCatch(error, info) {
        // Display fallback UI
        var main = this;
        this.setState({ hasError: true });
        axios.post(STATISTOC_HOST+"/bag_report/",{
            bag_text:"render crash: "+main.state.info + "\nError:"+error+"\nInfo: "+JSON.stringify(info),
            session:Cookies.get("hash")
        });
        // You can also log the error to an error reporting service
        console.log("ERROR:",error, info);
    }

    render() {
        if (this.state.hasError) {
            // You can render any custom fallback UI
            return <h3>Something went wrong: {this.state.info}</h3>;
        }
        if(!this.props.children){
            return  <div></div>

        }
        return this.props.children;
    }
}