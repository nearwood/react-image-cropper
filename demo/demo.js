import React from 'react';
import ReactDOM from 'react-dom';
import Css from './demo.less';
import Cropper from '../component/Cropper';

class ImageCropDemo extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            image: '',
            imageLoaded: false,
            image1: '',
            image1Loaded: false,
            image2: '',
            image2Loaded: false,
            image3: '',
            image3Loaded: false,
            image4: '',
            image4Loaded: false,
            image4BeforeLoaded: false,
            image4Values: ''
        };
    }

    onImageLoaded(state) {
        this.setState({
            [state + 'Loaded']: true
        });
    }

    onBeforeImageLoaded(state) {
        this.setState({
            [state + 'BeforeLoaded']: true
        });
    }

    onClick(state) {
        let node = this.refs[state];
        this.setState({
            [state]: node.crop()
        });
    }

    onClickValues(state) {
        let node = this.refs[state];
        this.setState({
            [state + 'Values']: node.values()
        });
    }

    render() {
        const src = "demo.jpg";
        return (
            <ul>
                <li>
                    <h3>Default image crop</h3>
                    <Cropper src={src} ref="image" imageLoaded={() => this.onImageLoaded('image')}/>
                    <br/>
                    {this.state.imageLoaded ? <button onClick={() => this.onClick('image')}>crop</button> : null}
                    <h4>after crop</h4>
                    {this.state.image ? <img width="200" src={this.state.image} alt=""/> : null}
                </li>
                <li>
                    <h3>With given origin X and Y</h3>
                    <Cropper src={src} originX={100} originY={100} ref="image1"
                             imageLoaded={() => this.onImageLoaded('image1')}/>
                    {this.state.image1Loaded ? <button onClick={() => this.onClick('image1')}>crop</button> : null}
                    <br/>
                    <h4>after crop</h4>
                    {this.state.image1 ? <img width="200" src={this.state.image1} alt=""/> : null}
                </li>
                <li>
                    <h3>With given rate</h3>
                    <Cropper src={src} rate={16 / 9} width={500} ref="image2"
                             imageLoaded={() => this.onImageLoaded('image2')}/>
                    <br/>
                    {this.state.image2Loaded ? <button onClick={() => this.onClick('image2')}>crop</button> : null}
                    <h4>after crop</h4>
                    {this.state.image2 ? <img width="200" src={this.state.image2} alt=""/> : null}
                </li>
                <li>
                    <h3>Disabled</h3>
                    <Cropper src={src} ref="image3" disabled={true}/>
                </li>
                <li>
                    <h3>Variable width and height, cropper frame is relative to natural image size, don't allow new
                        selection, set custom styles</h3>
                    <Cropper src={src}
                             width={300}
                             height={1113}
                             originX={650}
                             originY={386}
                             fixedRatio={false}
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
                             imageLoaded={() => this.onImageLoaded('image4')}
                             beforeImageLoaded={() => this.onBeforeImageLoaded('image4')}
                    />
                    <br/>
                    {this.state.image4BeforeLoaded ?
                        <button onClick={() => this.onClickValues('image4')}>values</button> : null}
                    <h4>values</h4>
                    {this.state.image4Values ? <p>{JSON.stringify(this.state.image4Values)}</p> : null}
                    {this.state.image4Loaded ? <button onClick={() => this.onClick('image4')}>crop</button> : null}
                    <h4>after crop</h4>
                    {this.state.image4 ? <img width="200" src={this.state.image4} alt=""/> : null}
                </li>
            </ul>
        );
    }
}

ReactDOM.render(<ImageCropDemo/>, document.getElementById('root'));
