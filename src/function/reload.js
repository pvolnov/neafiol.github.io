import axios from "axios";
import {WEB_HOST} from "../constants/config";
import Cookies from "js-cookie";

export default function reload(main) {

    if (window.navigator.onLine){
        window.location.reload();
    }

}