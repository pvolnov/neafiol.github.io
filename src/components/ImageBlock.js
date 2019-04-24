import React from "react";
import Gallery from "react-photo-gallery"
import Lightbox from 'react-images';

export class ImageBlok extends React.Component {
    constructor(props) {
        super(props);

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
    }

    openLightbox(event, obj) {
        this.setState({
            currentImage: obj.index,
            lightboxIsOpen: true,
        });
    }

    closeLightbox() {
        this.setState({
            currentImage: 0,
            lightboxIsOpen: false,
        });
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
                    <video preload={true} muted={true}
                           autoPlay={true} id="message_video" loop={true} playsinline={true} width="100%" height="100%">
                        <source src={this.state.fm.src}/>
                    </video>
                    :
                    this.state.fm && (<img onClick={this.showbigphoto}
                                           className={this.state.fm.img.height <= this.state.fm.img.width * 1.3 ? 'normalfullphoto' : 'fullphoto'}
                                           src={this.state.fm.src}/>
                    ))
                }
                </React.Fragment>
                <Gallery columns={(photos.length % 3 > 0) ? 2 : 3} margin={1} photos={photos}
                         onClick={this.openLightbox}/>
                <Lightbox images={photos}
                          onClose={this.closeLightbox}
                          onClickPrev={this.gotoPrevious}
                          onClickNext={this.gotoNext}
                          currentImage={this.state.currentImage}
                          isOpen={this.state.lightboxIsOpen}
                />
            </React.Fragment>

        );

        // return <div className={'imgblock'} >
        //     {this.state.impair&&
        //     Array.prototype.map.call(this.state.impair, function (pair, i) {
        //
        //         return(
        //             <div className={'imgblock'}>
        //                 <img  className={'rimage'} tabindex="0" src={pair[0]}></img>
        //                 <img  className={'rimage'}  tabindex="0" src={pair[1]}></img>
        //             </div>
        //
        //         );
        //     })
        //     }
        //     {(/\.mp4$/.test(this.state.fm))?
        //                 <video preload={true} muted={true}
        //                        autoPlay={true} id="message_video" loop={true} playsinline={true} width="100%" height="100%">
        //                     <source src={this.state.fm} />
        //                 </video>
        //         :
        //         <img onClick={this.showbigphoto}
        //              className={'fullphoto'} src={this.state.fm}/>
        //     }
        //
        //
        //
        // </div>
    }
}