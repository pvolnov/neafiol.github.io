import React from 'react';
import ActionSheet from "@vkontakte/vkui/dist/components/ActionSheet/ActionSheet";
import {
    ActionSheetItem,
    ANDROID,
    Avatar,
    Button,
    Cell,
    CellButton,
    Div,
    Epic,
    Group,
    HeaderButton,
    IOS,
    List,
    Panel,
    PanelHeader,
    platform,
    ScreenSpinner,
    Tabbar,
    TabbarItem,
    Tooltip,
    View
} from '@vkontakte/vkui';

import Icon24Download from '@vkontakte/icons/dist/24/download';
import Icon24ShareOutline from '@vkontakte/icons/dist/24/share_outline';

import Icon24ThumbDown from '@vkontakte/icons/dist/24/thumb_down';
import Icon24ThumbUp from '@vkontakte/icons/dist/24/thumb_up';
import Icon24MoreVertical from '@vkontakte/icons/dist/24/more_vertical';
import Icon24MoneyCircle from '@vkontakte/icons/dist/24/money_circle';
import {ImageBlok} from "./ImageBlock";
import {ErrorBoundary} from "../components/ErrorBoundary"
import {STATISTOC_HOST, VK_APPS_URL} from "../constants/config";
import connect from '@vkontakte/vkui-connect-promise';
import axios from "axios";
import Cookies from "js-cookie";


export default class Record extends React.Component {

    constructor(props) {
        super(props);
        this.osname = platform();

        this.store = props.store;
        this.parent = props.parent;
        this.setting = props.setting;

        if (this.setting == null) {
            this.setting = {}
        }
        if (!this.setting.adstatus) {
            this.setting.adstatus = {};
        }

        var record = props.record;

        //-------decorate text---------------\\
        var text = record.text || "";
        var entities = record.entities;
        text = this.textprepare(text, entities);

        var stext = (text).substr(0, 500);

        stext = stext.replace(/\s\S+$/giu, "");
        stext += "<a/><br/><span class='noselect show_more_text'>Показать полностью...</span>";


        var isfull = true;
        if (text.length > 500) {
            isfull = false;
        }
        this.state = {
            dislike: false,
            like: false,
            visible: true,
            firstadvertising: true,
            issaved: false,
            tooltip: false,
            small: isfull,
            onepost: props.onepost,
            savemenu: props.saved,
            isfull: isfull,
            full: isfull,
            text: isfull ? text : stext,
            ftext: text,
            stext: stext,
            title: title,
            advertising: record.adv,
            imgs: record.images,
            gname: record.group_title,
            gava: record.gava,
            postid: record.post_id,
            pusturl: record.pusturl,
            article: record.article || {},
            time: this.dataparse(record.time)
        };


        this.fullrecord = this.fullrecord.bind(this);
        this.saveRecord = this.saveRecord.bind(this);
        this.setparam = this.setparam.bind(this);
        this.unsetparam = this.unsetparam.bind(this);
        this.unsaveRecord = this.unsaveRecord.bind(this);
        this.sharePost = this.sharePost.bind(this);
        this.openSheet = this.openSheet.bind(this);

        try {
            var stitle = this.state.article.title || " ";
            title = stitle.substr(0, 45);
            if (stitle.length > 40)
                var title = title.replace(/\s([а-яА-Яa-zA-Z0-9]*?)$/giu, "..");
            this.state.article.title = title;
        } catch (e) {
        }


    }

    componentWillMount() {
        if (!this.setting.adblock) {
            if (this.state.advertising === 1) {
                this.state.advertising = 0;
            }
        }

        var adv = this.state.advertising;
        var advertising = localStorage.getItem("advertising");
        if (advertising != "" && advertising != null) {
            advertising = JSON.parse(advertising);

            if (advertising.indexOf(this.state.postid) > -1) {
                adv = 1;
                this.setState({
                    advertising: true,
                    savedadvertising: true,
                    firstadvertising: false,
                });
                if (this.state.savemenu) {
                    this.parent.deletePost();
                }
            }
        }
        //not advertising
        var unadvertising = localStorage.getItem("unadvertising");
        if (unadvertising != "" && unadvertising != null) {
            unadvertising = JSON.parse(unadvertising);
            if (unadvertising.indexOf(this.state.postid) > -1) {
                adv = 0;
            }
        }
        //Действие


        if (adv === 1 && !this.setting.adstatus.markadvpost) {
            this.setState({visible: false});
        } else if (adv === 1) {
            if (Cookies.get("new_rds") === "true") {
                this.setState({tooltip: true});
                Cookies.set("new_rds", false);
            }
        }


        var issave = false;
        var saved = localStorage.getItem("listsavedR");
        if (saved !== "" && saved != null) {
            saved = JSON.parse(saved);
            if (saved.indexOf(this.state.postid) > -1) {
                issave = true;
            }
        } else {
            localStorage.setItem("listsavedR", "[]");
        }
        var like = false;
        var liked = localStorage.getItem("like");
        if (liked != "" && liked != null) {
            liked = JSON.parse(liked);
            if (liked.indexOf(this.state.postid) != -1) {
                like = true;
            }
        }
        var dislike = false;
        var disliked = localStorage.getItem("dislike");

        if (disliked != "" && disliked != null) {
            disliked = JSON.parse(disliked);
            if (disliked.indexOf(this.state.postid) != -1) {
                dislike = true;
            }
        }


        this.setState({
            issaved: issave,
            like: like,
            dislike: dislike,
            advertising: adv
        })
    }
    componentDidUpdate(prevProps, prevState, snapshot) {
        // this.parent.forceUpdate();
    }


    dataparse(dstr) {
        if (typeof dstr != "string") return dstr;
        let dat = dstr.split(/[\.:\s]/);
        let month = ["Января", "Февраля", "Марта", "Апреля", "Мая", "Июня", "Июля", "Августа", "Сентября", "Октября", "Ноября", "Декабря"];
        let d = [dat[3], " ", month[dat[4] - 1], " ", dat[0], ":", dat[1], ", ", dat[5], "",];
        return d;
    }

    textprepare(text, entities) {


        if (!entities) {
            return text;
        }

        let lastlet = text.length;

        for (var e of entities.slice().reverse()) {

            if (lastlet < e['offset']) {
                continue;
            }

            var ds = text.substr(e['offset'], e['length']);
            var fs = text.substr(0, e['offset']);
            var ls = text.substr(e['offset'] + e['length']);


            if (e['_'] === "MessageEntityTextUrl") {
                ds = `<a rel="external" target="_blank" href="${e['url']}">${ds}</a>`;
            } else if (e['_'] === "MessageEntityUrl") {
                let url = ds;
                if (url.indexOf("http") < 0) {
                    url = "http://" + url;
                }
                ds = `<a rel="external" target="_blank" class="url"  href="${url}">${ds}</a>`;
            } else if (e['_'] === "MessageEntityMention") {
                ds = ds.replace("@", "");
                ds = `<a rel="external" target="_blank" href="https://t.me/${ds}">@${ds}</a>`;
            } else if (e['_'] === "MessageEntityBold") {
                ds = `<strong>${ds}</strong>`;
            } else if (e['_'] === "MessageEntityItalic") {
                ds = `<em>${ds}</em>`;
            } else if (e['_'] === "MessageEntityHashtag") {
                ds = `<span class="_hashtag">${ds}</span>`;
            } else {
                console.log(e['_'])
            }
            text = fs + ds + ls;
            lastlet = e['offset'];
        }
        text = text.replace(/\n/g, "<br/>");

        return text
    }

    fullrecord(e) {
        if (this.state.small) {
            return;
        }
        // this.store.dispatch({ type: 'SET_FULL_PHOTO',data:true});
        if (e.target.tagName === "A")
            return;
        if (this.state.full) {
            this.setState({text: this.state.stext, full: this.state.isfull})
        } else {

            this.setState({text: this.state.ftext, full: true})
        }
    }

    ruport(info) {
        axios.post(STATISTOC_HOST + "/raport/", {
            session: Cookies.get("hash"),
            info: {
                type: info,
                data: this.state.postid
            }
        })
    }

    sharePost(e) {
        var main = this;
        console.log("shere");
        connect.send("VKWebAppShare", {"link": VK_APPS_URL + "#post=" + this.state.postid})
            .catch(() => {
                console.log(e);
            }).then((r) => {

            console.log("share:", r);
        });
        main.ruport("repost");

    }

    unsaveRecord(e) {

        var saved = JSON.parse(localStorage.getItem("listsavedR"));
        var index = saved.indexOf(this.state.postid);
        if (index >= 0) {
            saved.splice(index, 1);
        }

        localStorage.setItem("listsavedR", JSON.stringify(saved));

        var newsaved = [];
        if (localStorage.getItem("savedR") != "") {
            var saved = JSON.parse(localStorage.getItem("savedR"));
            var newsaved = [];
            for (var i in saved) {
                var s = saved[i];
                if (s.post_id != this.state.postid) {
                    newsaved.unshift(s)
                }
            }
        }
        localStorage.setItem("savedR", JSON.stringify(newsaved));
        this.setState({issaved: false});
        if (this.state.savemenu) {
            this.setState({visible: false});
            this.parent.deletePost();
        }
    }

    saveRecord(e) {
        //list of saved records
        var saved = localStorage.getItem("listsavedR");
        if (saved != "" && saved != null) {
            saved = JSON.parse(saved);
            if (saved.indexOf(this.state.postid) < 0)
                saved.unshift(this.state.postid);
            else
                return;
            localStorage.setItem("listsavedR", JSON.stringify(saved))
        } else {
            localStorage.setItem("listsavedR", JSON.stringify([this.state.postid]))
        }

        var s = [];
        if (localStorage.getItem("savedR") !== "") {
            s = JSON.parse(localStorage.getItem("savedR"));
            if (Array.isArray(s)) {
                s.unshift(this.props.record);
            }
        }
        localStorage.setItem("savedR", JSON.stringify(s));
        this.setState({issaved: true});
        console.log("Saved");
    }

    setparam(name) {

        var items = [];
        if (localStorage.getItem(name) != "") {
            var s = JSON.parse(localStorage.getItem(name));
            if (Array.isArray(s)) {
                items = s;
            }
        }
        var par = {};
        par[name] = 1;
        this.setState(par);
        items.unshift(this.state.postid);
        localStorage.setItem(name, JSON.stringify(items));

        if (name === "advertising") {
            this.unsetparam("unadvertising");
            if (this.state.savemenu) {
                this.parent.deletePost();
            }
            if (!this.setting.adstatus.markadvpost)
                this.setState({"visible": false})
        }
        this.ruport(name);
    }

    unsetparam(name) {
        if (name == "advertising")
            this.setparam("unadvertising");


        var mas = JSON.parse(localStorage.getItem(name));
        if (mas === null) {
            mas = [];
        }

        var index = mas.indexOf(this.state.postid);
        if (index >= 0) {
            mas.splice(index, 1);
        }
        var par = {};
        par[name] = false;
        this.setState(par);
        localStorage.setItem(name, JSON.stringify(mas));
        this.ruport("un" + name);
    }

    openSheet() {
        var main = this;

        this.parent.setState({
                popout:
                    <ActionSheet
                        onClose={() => this.parent.setState({popout: null})}
                        title="Действия"
                        text="Дополнительные действия"
                    >

                        {
                            (!this.state.savemenu && this.state.advertising == 0) &&
                            <ActionSheetItem autoclose onClick={() => {
                                main.setparam("advertising");
                            }} theme="destructive">Рекламный пост!</ActionSheetItem>
                        }
                        {
                            (main.state.issaved || main.state.savemenu) ?
                                <ActionSheetItem autoclose theme="destructive" onClick={main.unsaveRecord}>Удалить из
                                    сохраненных</ActionSheetItem> :
                                <ActionSheetItem autoclose onClick={main.saveRecord}>Сохранить</ActionSheetItem>
                        }

                        {this.osname === IOS && <ActionSheetItem autoclose theme="cancel">Отмена</ActionSheetItem>}
                        {/*<ActionSheetItem >Отписаться от группы</ActionSheetItem>*/}
                        {/*<ActionSheetItem>Открыть в телеграм</ActionSheetItem>*/}
                    </ActionSheet>
            }
        )

    }


    render() {

        return (
            <ErrorBoundary  info={this.state.postid}>
                {this.state.visible ?
                    <Group className={"record"}>
                        <Cell className={"postheader"}
                              before={<Avatar onClick={()=>this.parent.addfilter(this.state.postid,this.state.gname)} src={this.state.gava} size={56}/>}
                              size="l"
                              multiline={true}
                              description={this.state.time}
                              asideContent={
                                  this.state.onepost ?
                                      <Button level="tertiary" size="m"//style={{float: "right", "color": "grey"}}
                                              onClick={this.sharePost}>
                                          <Icon24ShareOutline className={"passive_ico"}/>
                                      </Button>
                                      :
                                      <Icon24MoreVertical onClick={this.openSheet} className={"passive_ico post_setting"}/>
                              }
                        >{this.state.gname}</Cell>

                        <Div>
                            {this.state.text.length > 0 &&
                            <p dangerouslySetInnerHTML={{__html: (this.state.text)}} onClick={this.fullrecord}
                               className={"select " + this.state.full ? "fulltextarea" : "textarea"}>
                            </p>
                            }
                        </Div>

                        <div>
                        {this.state.imgs.length > 0 && this.state.imgs[0] !== "" &&
                        <ImageBlok parent={this.parent} imgs={this.state.imgs}/>
                        }

                        {this.state.article.img && this.state.article['url'].indexOf("https://t.me/") == -1 && <Div>
                            <div className="articleSnippet__block">
                                <div className="articleSnippet__thumb"
                                     style={{"backgroundImage": "url(" + this.state.article['img'] + ")"}}></div>
                                <div className="articleSnippet__inner">
                                    <div className="articleSnippet_info">
                                        <div className="articleSnippet_icon"></div>
                                        <div className="articleSnippet_title">{this.state.article['title']}</div>
                                        <div className="articleSnippet_author">{this.state.gname}</div>
                                        <a href={this.state.article['url']} className={"url"} target="_blank"
                                           className="articleSnippet_button">ОТКРЫТЬ
                                        </a>
                                    </div>
                                </div>
                            </div>


                        </Div>}
                        </div>
                        {/*{!this.state.article && <hr/>}*/}

                        {!this.state.onepost && (this.state.dislike ?
                                <Button level="tertiary" size="m" onClick={() => {
                                    this.unsetparam("dislike");
                                }}>
                                    <Icon24ThumbDown className={"activ_ico"}/>
                                </Button>
                                :
                                <Button level="tertiary" size="m" onClick={() => {
                                    this.setparam("dislike");
                                    this.unsetparam("like");

                                }}>
                                    <Icon24ThumbDown className={"passive_ico"}/>
                                </Button>
                        )
                        }
                        {!this.state.onepost && !this.state.savemenu && (this.setting.doublesaved || this.state.issaved ) && (this.state.issaved ?
                                <Button style={{float: "right"}} level="tertiary" size="m">
                                    <Icon24Download className={"activ_ico"} onClick={this.unsaveRecord}/>
                                </Button>
                                :
                                <Button className={"passive_ico"} style={{float: "right"}} level="tertiary" size="m">
                                    <Icon24Download onClick={this.saveRecord}/>
                                </Button>
                        )
                        }
                        {
                            (this.state.advertising > 0 &&

                                <Tooltip
                                    text="Чтобы убрать у поста рекламную пометку, нажмите на этот значок"
                                    // isShown={false}
                                    isShown={this.state.tooltip}
                                    onClose={() => this.setState({tooltip: false})}
                                    offsetX={5} alignX={"right"} offsetY={0}
                                >
                                    <Button level="tertiary" disabled={this.state.advertising > 1} style={{float: "right"}}
                                            size="m" onClick={() => {
                                        this.unsetparam("advertising");
                                    }}>

                                        <Icon24MoneyCircle
                                            className={this.state.advertising == 1 ? "passive_ico" : "active_ico"}/>
                                    </Button>
                                </Tooltip>


                            )
                        }


                        {!this.state.onepost && (this.state.like ?
                                <Button level="tertiary" size="m" onClick={() => {//style={{float: "right"}}
                                    this.unsetparam("like");
                                }}>
                                    <Icon24ThumbUp className={"activ_ico"}/>
                                </Button>
                                :
                                <Button level="tertiary" size="m" onClick={() => {//style={{float: "right"}}
                                    this.setparam("like");
                                    this.unsetparam("dislike");
                                }}>
                                    <Icon24ThumbUp className={"passive_ico"}/>
                                </Button>
                        )
                        }

                        {!this.state.onepost &&
                        <Button level="tertiary" size="m"//style={{float: "right", "color": "grey"}}
                                onClick={this.sharePost}>
                            <Icon24ShareOutline className={"passive_ico"}/>
                        </Button>}


                    </Group>
                    :
                    <React.Fragment>
                        {
                            //&& this.state.firstadvertising
                            (!this.state.savemenu && !this.setting.adstatus.hideadvpost) &&
                            <Group>
                                <CellButton expandable="true" onClick={() => {
                                    if (Cookies.get("new_rds") === "true") {
                                        this.setState({tooltip: true});
                                        Cookies.set("new_rds", false);
                                    }

                                    // this.unsetparam("advertising");
                                    this.setState({"visible": true})
                                }} align={"center"}>Скрыт рекламный пост. Показать?</CellButton>
                            </Group>
                        }
                    </React.Fragment>

                }
            </ErrorBoundary>
        )
    }
}





