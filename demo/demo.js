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
        this.setState({
            [state + 'BeforeLoaded']: true
        });
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
        return (
            <ul>

                <li>
                    <h3>Variable width and height, cropper frame is relative to natural image size, don't allow new
                        selection, set custom styles, set max image width and height</h3>
                    <div style={styles.image4}>
                        <Cropper src={"demo.jpg"}
                                 imageWidth={300}
                                 fixedRatio={true}
                                 rate={275 / 137}
                                 onDragStop={() => this.OnClick('image4')}
                                 selectionNatural={true}
                                 allowNewSelection={false}
                                 styles={{
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
                                 }}
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
    image4: {
        width: 200,
        height: 300
    }
};

ReactDOM.render(<ImageCropDemo/>, document.getElementById('root'))
