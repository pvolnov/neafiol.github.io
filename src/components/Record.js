import React from 'react';
import ActionSheet from "@vkontakte/vkui/dist/components/ActionSheet/ActionSheet";
import {
    View,
    Panel,
    ActionSheetItem,
    PanelHeader,
    ScreenSpinner,
    Tooltip,
    Avatar,
    Group,
    List,
    Cell,
    CellButton,
    HeaderButton,
    TabbarItem,
    Tabbar,
    Epic,
    Div,
    Button
} from '@vkontakte/vkui';

import Icon24Download from '@vkontakte/icons/dist/24/download';
import Icon24ShareOutline from '@vkontakte/icons/dist/24/share_outline';

import Icon24ThumbDown from '@vkontakte/icons/dist/24/thumb_down';
import Icon24ThumbUp from '@vkontakte/icons/dist/24/thumb_up';
import Icon24Send from '@vkontakte/icons/dist/24/send';
import Icon24MoreVertical from '@vkontakte/icons/dist/24/more_vertical';
import Icon24MoneyCircle from '@vkontakte/icons/dist/24/money_circle';
import {ImageBlok} from "./ImageBlock";
import {ErrorBoundary} from "../components/ErrorBoundary"
import {STATISTOC_HOST, VK_APPS_URL} from "../constants/config";
import connect from '@vkontakte/vkui-connect-promise';
import axios from "axios";
import Cookies from "js-cookie";
import {platform, IOS, ANDROID} from '@vkontakte/vkui';


export default class Record extends React.Component {

    constructor(props) {
        super(props);
        this.osname = platform();

        this.store = props.store;
        this.parents = props.parents;


        //-------decorate text---------------\\
        var text = props.text || "";
        var entities = props.entities;
        text = this.textprepare(text, entities);
        var stext = (text).substr(0, 500);

        stext = stext.replace(/\s\S+$/giu, "");
        stext += "<a/><br/><span class='noselect show_more_text'>Показать полностью...</span>";


        var isfull = true;
        if (text.length > 500) {
            isfull = false;
        }
        if (props.saved) {
            this.state = props.state;
            this.state.visible = true;
            this.state.savemenu = true;
        } else {

            this.state = {
                dislike: false,
                like: false,
                advertising: false,
                visible: true,
                firstadvertising:true,
                small: isfull,
                onepost: props.onepost,
                isfull: isfull,
                full: isfull,
                text: isfull ? text : stext,
                ftext: text,
                stext: stext,
                title: title,
                imgs: props.imgs,
                gname: props.gname,
                gava: props.gava,
                postid: props.postid,
                pusturl: props.pusturl,
                issaved: false,
                article: props.article || {},
                time: this.dataparse(this.props.time || "10:40:08 20.03.2018")
            };
        }
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
        var issave = false;
        var saved = localStorage.getItem("listsavedR");
        if (saved === "") localStorage.setItem("listsavedR", "[]");
        if (saved != "" && saved != null) {
            saved = JSON.parse(saved);
            if (saved.indexOf(this.state.postid) != -1) {
                issave = true;
            }
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
        var adv = false;
        var advertising = localStorage.getItem("advertising");

        if (advertising != "" && advertising != null) {
            advertising = JSON.parse(advertising);
            if (advertising.indexOf(this.state.postid) != -1) {
                adv = true;
                this.setState({advertising:true,
                    firstadvertising:false,
                    visible:false});
                if (this.state.savemenu) {
                    this.setState({
                        visible: false});
                    this.parents.deletePost();
                }
            }
        }

        this.setState({
            issaved: issave,
            like: like,
            dislike: dislike,
            advertising: adv
        })
    }

    dataparse(dstr) {
        if (typeof dstr != "string") return dstr;
        let dat = dstr.split(/[\.:\s]/);
        let month = ["Января", "Февраля", "Марта", "Апреля", "Мая", "Июня", "Июля", "Августа", "Сентября", "Октября", "Ноября", "Декабря"];
        let d = [dat[3], " ", month[dat[4] - 1], ", ", dat[0], ":", dat[1]];
        return d

    }

    textprepare(text, entities) {
        var lastlet = text.length;

        if (!entities) {
            return text;
        }

        for (var e of entities.reverse()) {
            if (lastlet < e['offset']) continue;
            var ds = text.substr(e['offset'], e['length']);
            var fs = text.substr(0, e['offset']);
            var ls = text.substr(e['offset'] + e['length']);
            if (e['_'] === "MessageEntityTextUrl") {
                ds = `<a  href="${e['url']}">${ds}</a>`;
            }
            if (e['_'] === "MessageEntityUrl") {
                ds = `<a class="url"  href="${ds}">${ds}</a>`;
            }
            if (e['_'] === "MessageEntityMention") {
                ds = ds.replace("@", "");
                ds = `<a  href="https://t.me/${ds}">@${ds}</a>`;
            }
            if (e['_'] === "MessageEntityBold") {
                ds = `<strong>${ds}</strong>`;
            }
            if (e['_'] === "MessageEntityItalic") {
                ds = `<em>${ds}</em>`;
            }
            if (e['_'] === "MessageEntityHashtag") {
                ds = `<span class="hashtag">${ds}</span>`;
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

        var posTop = (window.pageYOffset !== undefined) ? window.pageYOffset : (document.documentElement).scrollTop;
        document.documentElement.scrollTop = posTop + 100;
        connect.send("VKWebAppScroll", {"top": posTop + 100, "speed": 300});
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
        connect.send("VKWebAppShare", {"link": VK_APPS_URL + "#post=" + this.state.postid}).catch(() => {
            console.log(e);
        });

    }

    unsaveRecord(e) {

        var saved = JSON.parse(localStorage.getItem("listsavedR"));
        var newsaved = [];
        for (var i in saved) {
            var s = saved[i];
            if (s != this.state.postid) {
                newsaved.unshift(s)
            }
        }
        localStorage.setItem("listsavedR", JSON.stringify(newsaved));

        var newsaved = [];
        if (localStorage.getItem("savedR") != "") {
            var saved = JSON.parse(localStorage.getItem("savedR"));
            var newsaved = [];
            for (var i in saved) {
                var s = saved[i];
                if (s.postid != this.state.postid) {
                    newsaved.unshift(s)
                }
            }
        }
        localStorage.setItem("savedR", JSON.stringify(newsaved));
        this.setState({issaved: false});
        if (this.state.savemenu) {
            this.setState({visible: false});
            this.parents.deletePost();
        }
    }

    saveRecord(e) {
        var items = [];
        this.setState({issaved: true});

        //list of saved records
        var saved = localStorage.getItem("listsavedR");
        if (saved != "" && saved != null) {
            saved = JSON.parse(saved);
            saved.unshift(this.state.postid);
            localStorage.setItem("listsavedR", JSON.stringify(saved))
        }
        items = [];
        var itm = {};
        itm = (this.state);
        items.push(itm);
        if (localStorage.getItem("savedR") !== "") {
            var s = JSON.parse(localStorage.getItem("savedR"));
            if (Array.isArray(s)) {
                items = items.concat(s);
            }
        }
        localStorage.setItem("savedR", JSON.stringify(items));
    }

    setparam(name) {
        if (name === "advertising") {
            if (this.state.savemenu) {
                this.parents.deletePost();
            }
            this.setState({"visible": false})
        }
        var items = [];
        if (localStorage.getItem(name) != "") {
            var s = JSON.parse(localStorage.getItem(name));
            if (Array.isArray(s)) {
                items = s;
            }
        }
        var par = {};
        par[name] = true;
        this.setState(par);
        items.unshift(this.state.postid);
        localStorage.setItem(name, JSON.stringify(items));
        this.ruport(name);
    }

    unsetparam(name) {
        var mas = JSON.parse(localStorage.getItem(name));
        var m = [];
        for (var i in mas) {
            var s = mas[i];
            if (s != this.state.postid) {
                m.unshift(s)
            }
        }
        var par = {};

        par[name] = false;
        this.setState(par);
        localStorage.setItem(name, JSON.stringify(m));
        this.ruport("un" + name);
    }

    openSheet() {
        var main = this;
        var saved = this.state.issaved;

        this.parents.setState({
                popout:
                    <ActionSheet
                        onClose={() => this.parents.setState({popout: null})}
                        title="Действия"
                        text="Дополнительные действия"
                    >

                        {
                            !this.state.advertising &&
                            <ActionSheetItem autoclose onClick={() => {
                                main.setparam("advertising")
                            }} theme="destructive">Рекламный пост!</ActionSheetItem>
                        }
                        {
                            saved ?
                                <ActionSheetItem autoclose theme="destructive" onClick={main.unsaveRecord}>Удалить из
                                    сохраненных</ActionSheetItem> :
                                <ActionSheetItem autoclose onClick={main.saveRecord}>Сохранить</ActionSheetItem>
                        }

                        {this.osname === IOS && <ActionSheetItem autoclose theme="cancel">Закрыть</ActionSheetItem>}
                        {/*<ActionSheetItem >Отписаться от группы</ActionSheetItem>*/}
                        {/*<ActionSheetItem>Открыть в телеграм</ActionSheetItem>*/}
                    </ActionSheet>
            }
        )

    }

    render() {

        return (
            <ErrorBoundary info={this.state.postid}>
                {this.state.visible ? <Group>
                        <Cell className={"postheader"}
                              before={<Avatar src={this.state.gava} size={54}/>}
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
                                      <Button level="tertiary" size="m" onClick={this.openSheet} type={""}>
                                          <Icon24MoreVertical className={"passive_ico"}/>
                                      </Button>
                              }
                        >{this.state.gname}</Cell>

                        <Div>
                            {this.state.text.length > 0 &&
                            <p dangerouslySetInnerHTML={{__html: (this.state.text)}} onClick={this.fullrecord}
                               className={this.state.full ? "fulltextarea" : "textarea"}>
                            </p>
                            }
                        </Div>


                        {this.state.imgs.length > 0 && this.state.imgs[0] !== "" &&
                        <ImageBlok imgs={this.state.imgs}/>
                        }

                        {this.state.article.img && this.state.article['url'].indexOf("https://t.me/") == -1 && <Div>
                            <a class="articleSnippet__block">
                                <div className="articleSnippet__thumb"
                                     style={{"background-image": "url(" + this.state.article['img'] + ")"}}></div>
                                <div class="articleSnippet__inner">
                                    <div class="articleSnippet_info">
                                        <div class="articleSnippet_icon"></div>
                                        <div class="articleSnippet_title">{this.state.article['title']}</div>
                                        <div class="articleSnippet_author">{this.state.gname}<span class=""></span></div>
                                        <a href={this.state.article['url']} className={"url"} target="_blank"
                                            class="articleSnippet_button">ОТКРЫТЬ
                                        </a>
                                    </div>
                                </div>
                            </a>

                        </Div>}
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
                        {(this.state.advertising &&
                            <Button level="tertiary" size="m" onClick={() => {
                                this.unsetparam("advertising");
                            }}>
                                <Icon24MoneyCircle className={"passive_ico"}/>
                            </Button>
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

                        {!this.state.onepost && !this.state.savemenu &&(this.state.issaved ?
                                <Button style={{float: "right"}} level="tertiary" size="m">
                                    <Icon24Download className={"activ_ico"} onClick={this.unsaveRecord}/>
                                </Button>
                                :
                                <Button className={"passive_ico"} style={{float: "right"}} level="tertiary" size="m">
                                    <Icon24Download onClick={this.saveRecord}/>
                                </Button>
                        )
                        }

                    </Group>
                    :
                    <React.Fragment>
                        {!this.state.savemenu && this.state.firstadvertising &&
                        <Group>
                            <CellButton expandable={true} onClick={() => {
                                this.unsetparam("advertising");
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





