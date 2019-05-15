import axios from "axios";
import {WEB_HOST} from "../constants/config";
import Cookies from "js-cookie";

export default function reload(main) {

    axios.post(WEB_HOST + '/webinfo/', {
        },
    ).then((r)=> {
            console.log("reload");
            window.location.reload();
        }
    ).catch((e)=>{
        main.offline();
        return false;
    });

}