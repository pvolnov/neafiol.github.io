import React from "react";
import Gallery from "react-photo-gallery"
import Lightbox from 'react-images';
import {Alert} from "./Setting";


export class ImageBlok extends React.Component {
    constructor(props) {
        super(props);
        this.parent=props.parent;

        var imges = [];
        var fm = false;
        if (this.props.imgs != null)
            imges = this.props.imgs;

        //first photo is big
        if (imges.length === 1 || imges.length === 5 || imges.length === 7) {
            fm = {};
            // console.log(imges.length,"TO");
            fm.img = new Image();
            fm.img.src = imges[0];
            fm.src = imges[0];
            imges = imges.slice(1, imges.length);
        }
        // console.log(imges.length);

        var images = [];
        var main = this;

        for (var im in imges) {
            if (imges[im] == "") {
                continue;
            }
            var img = new Image();
            img.onload = () => {
                main.forceUpdate();
                console.log("load");
                // main.parent.updatemarking();
            };
            img.src = imges[im];
            images.push(img);

        }


        this.state = {
            images: images,
            fm: fm,
            fullnow: false,
            currentImage: 0
        };
        this.showbigphoto = this.showbigphoto.bind(this);
        this.closeLightbox = this.closeLightbox.bind(this);
        this.openLightbox = this.openLightbox.bind(this);
        this.gotoNext = this.gotoNext.bind(this);
        this.gotoPrevious = this.gotoPrevious.bind(this);
        this.showall = this.showall.bind(this);
    }

    componentDidMount() {

    }

    openLightbox(event, obj) {
        this.setState({
            currentImage: obj.index,
            lightboxIsOpen: true,
        });
        var main = this;
        window.onpopstate = (e) => {
            window.history.pushState(null, null, window.location.href);
            main.closeLightbox();
            return true;

        }
    }

    closeLightbox() {
        this.setState({
            currentImage: 0,
            lightboxIsOpen: false,
        });
        this.parent.baseOnpopstate(this.parent);
    }

    gotoPrevious() {
        this.setState({
            currentImage: this.state.currentImage - 1,
        });
    }

    gotoNext() {
        this.setState({
            currentImage: this.state.currentImage + 1,
        });
    }


    showbigphoto(e) {
        // var newWin = window.open(this.state.fm, "hello", "");
        if (!this.state.fullnow) {
            e.target.className += " showfullphoto";
            this.setState({fullnow: true});
        } else {
            e.target.className = e.target.className.replace("showfullphoto", "");
            this.setState({fullnow: false});
        }
        this.parent.forceUpdate();

    }
    showall(e){
        if(this.full){
            document.exitFullscreen();
            this.full = false;
            return;
        }
        this.full=true;

        console.log(e)
        e.target.requestFullscreen()
    }

    render() {
        var photos = [];
        for (var i in this.state.images) {
            photos.push({
                src: this.state.images[i].src,
                width: this.state.images[i].width ? this.state.images[i].width : 1,
                height: this.state.images[i].height ? this.state.images[i].height : 1
            });
        }

        return (
            <React.Fragment>
                <React.Fragment>{this.state.fm && ((/\.mp4$/.test(this.state.fm.src)) ?
                    <video preload={"metadata"}   style={{"maxHeight":window.screen.height-100}}
                           autoPlay={true} id="message_video" src={this.state.fm.src}  width="100%" >
                    </video>
                    :
                    this.state.fm && (<img onClick={this.showbigphoto}
                                           // onClickImage={this.showall}
                                           className={this.state.fm.img.height <= this.state.fm.img.width * 1.3 ? 'normalfullphoto' : 'fullphoto'}
                                           src={this.state.fm.src}/>
                    ))
                }
                </React.Fragment>
                <Gallery columns={(photos.length % 3 > 0) ? 2 : 3} margin={1} photos={photos}
                         onClick={this.openLightbox}/>
                <Lightbox images={photos}
                          imageCountSeparator={" из "}
                          onClose={this.closeLightbox}
                          onClickPrev={this.gotoPrevious}
                          onClickNext={this.gotoNext}
                          currentImage={this.state.currentImage}
                          isOpen={this.state.lightboxIsOpen}
                />
            </React.Fragment>

        );


    }
}