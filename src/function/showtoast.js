import {toast} from "react-toastify";

export default function showtoast(text, type = toast.TYPE.INFO, time = 2500) {

    var ntoast = this.state.toast;
    if (ntoast > 0) {
        return;
    }
    if(!this.android ){
        setTimeout(()=>this.setState({header:false}),400);
        setTimeout(()=>this.setState({header:true}),time+50);
    }
    this.state.toast = 1;

    toast.info(text, {
        position: toast.POSITION.TOP_CENTER,
        type: type,
        hideProgressBar: true,
        draggable: false,
        closeOnClick: false,
        autoClose: time,
        onClose: this.closeToast,
        className: this.android ? "toast_android" : "toast_iphone"
    });
}