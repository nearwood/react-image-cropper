import React from 'react';
import ReactDOM from 'react-dom';
import Css from './demo.less';
import Cropper from '../component/Cropper';

const ImageCropDemo = React.createClass({
    getInitialState() {
        return {
            image: '',
            imageLoaded: false,
            image1: '',
            imageL1oaded: false,
            image2: '',
            image2Loaded: false,
            image3: '',
            image3Loaded: false,
            image4: '',
            image4Loaded: false,
            image4BeforeLoaded: false,
            image4Values: ''
        };
    },

    OnImageLoaded(state){
        this.setState({
            [state + 'Loaded']: true
        });
    },

    OnBeforeImageLoaded(state){
        let img = this.refs && this.refs[state] && this.refs[state].refs && this.refs[state].refs.img;
        let newState = {
            [state + 'BeforeLoaded']: true
        };

        if(img && imgSize.default_width && imgSize.default_height && img.naturalWidth && img.naturalHeight) {
            let img_width = imgSize.default_width;
            let img_height = imgSize.default_height;
            let naturalWidth = img.naturalWidth;
            let naturalHeight = img.naturalHeight;
            img_width = naturalWidth < naturalHeight ? (img_width * naturalWidth / naturalHeight) : img_width;
            img_height = naturalHeight > naturalWidth ? img_height: (img_height * naturalWidth / naturalHeight);
            imgSize.img_width = img_width;
            imgSize.img_height = img_height;
        }
        this.setState(newState);
    },

    OnImageLoadError(e) {
        console.error(e);
    },

    OnClick(state){
        let node = this.refs[state];
        this.setState({
            [state]: node.crop()
        });
    },

    OnClickValues(state){
        let node = this.refs[state];
        this.setState({
            [state + 'Values']: node.values()
        });
    },
    render() {
        const src = "demo.jpg";
        const srcTall = 'tallimage.jpg';
        return (
            <ul>
                <li>
                    <h3>Default image crop</h3>
                    <Cropper src={src} ref="image" imageLoaded={() => this.OnImageLoaded('image')}/>
                    <br/>
                    {this.state.imageLoaded ? <button onClick={() => this.OnClick('image')}>crop</button> : null}
                    <h4>after crop</h4>
                    {this.state.image ? <img width="200" src={this.state.image} alt=""/> : null}
                </li>
                <li>
                    <h3>With given origin X and Y</h3>
                    <Cropper src={src} originX={100} originY={100} ref="image1"
                             imageLoaded={() => this.OnImageLoaded('image1')}/>
                    {this.state.image1Loaded ? <button onClick={() => this.OnClick('image1')}>crop</button> : null}
                    <br/>
                    <h4>after crop</h4>
                    {this.state.image1 ? <img width="200" src={this.state.image1} alt=""/> : null}
                </li>
                <li>
                    <h3>With given rate</h3>
                    <Cropper src={src} rate={16 / 9} width={500} ref="image2"
                             imageLoaded={() => this.OnImageLoaded('image2')}/>
                    <br/>
                    {this.state.image2Loaded ? <button onClick={() => this.OnClick('image2')}>crop</button> : null}
                    <h4>after crop</h4>
                    {this.state.image2 ? <img width="200" src={this.state.image2} alt=""/> : null}
                </li>
                <li>
                    <h3>Disabled</h3>
                    <Cropper src={src} ref="image3" disabled={true}/>
                </li>
                <li>
                    <h3>Missing source</h3>
                    <Cropper src={'404.jpg'} ref="image5" imageLoadError={this.OnImageLoadError}/>
                </li>
                <li>
                    <h3>Variable width and height, cropper frame is relative to natural image size, don't allow new
                        selection, set custom styles</h3>
                    <div style={styles.image4Wrapper}>
                        <Cropper src={srcTall}
                                 width={320}
                                 height={240}
                                 imgSize={imgSize}
                                 originX={650}
                                 originY={386}
                                 fixedRatio={false}
                                 selectionNatural={true}
                                 allowNewSelection={false}
                                 styles={styles.cropper}
                                 ref="image4"
                                 imageLoaded={() => this.OnImageLoaded('image4')}
                                 beforeImageLoaded={() => this.OnBeforeImageLoaded('image4')}
                        />
                    </div>
                    <br/>
                    {this.state.image4BeforeLoaded ?
                        <button onClick={() => this.OnClickValues('image4')}>values</button> : null}
                    <h4>values</h4>
                    {this.state.image4Values ? <p>{JSON.stringify(this.state.image4Values)}</p> : null}
                    {this.state.image4Loaded ? <button onClick={() => this.OnClick('image4')}>crop</button> : null}
                    <h4>after crop</h4>
                    {this.state.image4 ? <img width="200" src={this.state.image4} alt=""/> : null}
                </li>
            </ul>
        );
    }
});

const styles = {
    image4Wrapper: {
        position: 'relative',
        width: 309,
        height: 309
    },
    cropper: {
        source_img: {
            WebkitFilter: 'blur(3.5px)',
            filter: 'blur(3.5px)'
        },
        modal: {
            opacity: 0.5,
            backgroundColor: '#fff'
        },
        dotInner: {
            borderColor: '#ff0000'
        },
        dotInnerCenterVertical: {
            backgroundColor: '#ff0000'
        },
        dotInnerCenterHorizontal: {
            backgroundColor: '#ff0000'
        }
    }
};
const imgSize = {
    default_width: 309,
    default_height: 309
}
ReactDOM.render(<ImageCropDemo/>, document.getElementById('root'))
