import React from "react";
import axios from "axios";
import Record from "../components/Record";
import {CellButton,Tooltip,Footer, PullToRefresh,Group, Panel, PanelHeader, ScreenSpinner, View} from '@vkontakte/vkui';
import Cookies from "js-cookie";
import {HOST,STATISTOC_HOST} from '../constants/config'
import connect from '@vkontakte/vkui-connect-promise';
import {toast, ToastContainer} from "react-toastify";

export default  class RecordList extends React.Component {
    constructor(props) {
        super(props);
        this.store = props.store;
        this.dispatch=props.dispatch;


        this.httpClient = axios.create();
        this.httpClient.defaults.timeout = 20000;

        this.state={
            actPanel:"main",//active panel
            id:props.id,//view id
            menu:[],//list of our records
            poput:null,
            fetching: false,
            isuploading:true,
            fullphoto:{url:""}
        };

        this.uploadnews = this.uploadnews.bind(this);
        this.getstatistic = this.getstatistic.bind(this);
        this.checkend = this.checkend.bind(this);
        this.createRecords = this.createRecords.bind(this);
        this.showtoast = this.showtoast.bind(this);
        this.closeToast = this.closeToast.bind(this);

        this.cond={
            isnew:true
        };

    }
    componentWillMount() {
        if(this.store.list)
        if(this.store.list.length<2){
            this.uploadnews(-1);
        }
        else {
            this.setState({
                menu: this.store.list
            });
        }
        //we can't sent too many data in our recuest:
        setTimeout(this.getstatistic,2000,[],0);



    }
    componentDidMount() {
        document.documentElement.scrollTop=this.store.y;
        connect.send("VKWebAppScroll", {"top": this.store.y});

        var main=this;
        window.onscroll = ()=> {
            var posTop = (window.pageYOffset !== undefined) ? window.pageYOffset : (document.documentElement ).scrollTop;
            main.dispatch({ type: 'SET_MAIN_Y',data:posTop });
        }
    }
    closeToast(){
        this.state.toast-=1;
    }
    showtoast(text,type,autoClose=2000){
        var closeToast=this.closeToast;
        var ntoast = this.state.toast;
        if(ntoast>0){
            return;
        }
        this.state.toast+=1;

        toast.info(text, {
            position: toast.POSITION.TOP_CENTER,
            type:type,
            closeOnClick:false,
            hideProgressBar:true,
            draggable:false,
            onClose:closeToast,
            className: 'toast',
            autoClose:autoClose
        })
    }

    getstatistic(mas,n){
        let delaytime=500;
        var centerX = document.documentElement.clientWidth / 2;
        var centerY = document.documentElement.clientHeight / 3;

        var elem = document.elementFromPoint(centerX, centerY);
        while (elem.parentNode.tagName) {

            try{
                if(elem.attributes['identy']!=null){
                    let ident = elem.attributes['identy'].value;
                    let ident_key = Number(elem.attributes['identy_key'].value);
                    this.checkend(ident_key);
                    let type = elem.attributes['type'].value;
                    var isinmas =false;
                    for(var i =0;i<mas.length;i++){
                        if(mas[i]['id']===ident){
                            mas[i].time+=delaytime;
                            isinmas=true;
                            break;
                        }
                    }
                    if(!isinmas)
                        mas.push({'type':'vkrecord',id:ident,posttype:type,time:delaytime});
                    break;
                }
            }
            catch (e) {
                console.error(e);
            }
            elem = elem.parentNode;
        }

        if (n>30 && mas.length>0){
            n=0;
            console.log("message");
            var mas1=mas;
            this.httpClient.post(STATISTOC_HOST + '/new_stat/', {
                        statistic: mas,
                        session: Cookies.get('hash'),
                },

            ).catch(()=>{
                //if we coudn't sent a recuest
                    mas=mas1;
                }
            );
            var setting={};
            if(Cookies.get("Setting")!=null)
                setting = JSON.parse(Cookies.get("Setting"));
            setting.timeinapp=delaytime*30+(setting.timeinapp);
            for(var m in mas) {
                if(mas[m].time>3000){
                    setting.postshow = (setting.postshow | 0) + 1;

                }
            }
            Cookies.set("Setting",setting);
            mas=[];
        }

        setTimeout(this.getstatistic,delaytime,mas,n+1);
    }
    checkend(elem){
        if(!this.state.menu)return;
        if(this.state.isuploading || this.state.menu.length<5 ){
            // console.log("uploading",elem);
            return;
        }
        var i = 0;
        var n = this.state.menu.length<10?6:9;
        // console.log(elem);
        while (i<n) {
            i++;
            if (elem === this.state.menu.length - i) {
                // console.log("UPLOAD ",this.state.menu.length,i);
                this.uploadnews( 1);
                break;
            }

        }
    }
    //spesial request that get some recirds from server
    uploadnews(type=0){

        var count =0;

        var post_now = this.state.menu && this.state.menu.length;
        var f15 = false;
        if(type===-1){
            f15=true;
            type=0;
            // console.log("f15")
        }
        var main = this;
        console.log("AUTAPLOAD ",type);


        switch (type) {
            case 0:{
                if(main.cond.gloabaluploading){
                    break;
                }

                count=150;
                post_now=this.store.full_list && this.store.full_list.length;
                main.cond.gloabaluploading=true;

                this.httpClient.get(HOST + '/get/', {
                        params: {
                            amount:count,
                            type : type,
                            post_now:post_now,
                            session: Cookies.get('hash'),
                            get: 1
                        }
                    }
                ).then((res)=>{
                    if(res.data["status"]==="_wrong_session"){
                        Cookies.set("auth","false");
                        Cookies.set("hash","");
                        console.log("ERR");
                        window.location.reload();
                        return;
                    }

                    res=res.data;
                    main.setState({
                        fetching: false,
                        popout: null});
                    var new_posts = main.store.full_list;
                    new_posts=new_posts.concat(res['posts']);
                    main.dispatch({ type: 'UPDATE_RECORD_LIST',data:new_posts});
                    setTimeout(()=>{main.cond.gloabaluploading=false;},10000);
                    main.setState({isuploading:false});
                    console.log(new_posts);
                }).catch(function (error) {
                    console.log(error);
                    main.setState({
                        fetching: false,
                        popout: null});
                    //end of uploading
                    // setTimeout(main.uploadnews,2000);
                    setTimeout(()=>{main.cond.gloabaluploading=false;},3000);
                });
                break;
            }
            case 1:{
                main.setState({isuploading:true});
                console.log("update  new");
                var full_list=this.store.full_list;
                if(full_list.length<10)
                    break;

                for(var i =post_now;i<post_now+15;i++){
                    var p = full_list[i];
                    // console.log(p);
                    var d =false;
                    //FORS ANTIDUBLICAT SYSTEM
                    for(var j in this.state.menu){
                        if(p.post_id===this.state.menu[j].post_id){
                            console.log("FIND DUBLICAT",p.post_id);
                            full_list.splice(i,1);
                            d=true;
                            break;
                        }
                    }
                    if(!d)
                    this.state.menu.push(p)
                }
                this.forceUpdate();
                this.dispatch({ type: 'RECORDS_UPDATE',data:this.state.menu });
                setTimeout(()=>{main.setState({isuploading:false});},1000);

                if(full_list.length-30<this.state.menu.length){
                    this.uploadnews(0)
                }
                this.setState({
                    popout: null,
                    // fetching: false
                });
                break;
            }
            //check end
            case 2:{
                if(this.state.isuploading)
                this.setState({
                    popout: <ScreenSpinner />,
                    // fetching: false
                });
                else {
                    this.uploadnews();
                }
                break;
            }
        }

        if(f15){
            this.setState({
                popout: <ScreenSpinner />,
                // fetching: false
            });
            this.httpClient.get(HOST + '/get/', {
                    params: {
                        amount:15,
                        type : -1,
                        post_now:0,
                        session: Cookies.get('hash'),
                        get: 1
                    }
                }
            ).then((resp)=>{
                console.log(resp);
                if(resp.data.status!=="ok"){
                    main.showtoast(resp.data.status,toast.TYPE.ERROR)
                }

                main.setState({menu:resp.data.posts,
                    fetching: false,
                    popout: null});
                main.dispatch({ type: 'RECORDS_UPDATE',data:main.state.menu });
            }).catch(()=>{
                main.setState({
                    fetching: false,
                    popout: null});
            })
        }


    }

    createRecords = (menu) => {
        let rlist = [];
        var main = this;        // Outer loop to create parent

        for (let i in menu) {
            let item = menu[i];
            //Create the parent and add the children
            // try {
            try{
            if(item)
                rlist.push(
                    <div key={i} role={"StatisticInfo"} identy_key={i} identy={item['post_id']} type={item['type'] || 0}>
                        <Record
                            parents={main}
                            dispatch={main.dispatch}
                            entities={item['entities']}
                            text={item['text']}
                            gname={item['group_title']}
                            title={item['title']}
                            imgs={item['images']}
                            gava={item['gava']}
                            pusturl={item['pusturl']}
                            article={item['article']}
                            time={item['time']}
                            postid={item['post_id']}/>
                    </div>
                );
            }
            catch (e) {
                console.log("Error write post")
            }
        }
        return rlist;
    };
    render() {

        return (
            <View id={this.state.id}   popout={this.state.popout} activePanel={this.state.actPanel}>
                <Panel id="main" >
                    <PanelHeader>Новости</PanelHeader>
                    <ToastContainer  />
                    <PullToRefresh onRefresh={()=>{window.location.reload()}} isFetching={this.state.fetching}>
                    {this.state.menu&&
                    this.createRecords(this.state.menu)}
                    </PullToRefresh>

                    {!this.state.isuploading &&
                    <Group>
                        <CellButton align="center" onClick={() => {
                            this.uploadnews(2);
                        }}>
                            Загрузка
                        </CellButton>
                    </Group>
                    }
                    {
                        !this.state.isuploading && this.state.menu.length===0 &&
                            <Footer>У вас нет групп</Footer>
                    }

                </Panel>


            </View>
        )
    }
}
