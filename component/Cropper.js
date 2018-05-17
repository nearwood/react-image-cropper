const React = require('react');
const ReactDOM = require('react-dom');
const deepExtend = require('deep-extend');

const Cropper = React.createClass({
    PropTypes: {
        src: React.PropTypes.string.isRequired,
        originX: React.PropTypes.number,
        originY: React.PropTypes.number,
        rate: React.PropTypes.number,
        width: React.PropTypes.number,
        height: React.PropTypes.number,
        selectionNatural: React.PropTypes.bool,
        fixedRatio: React.PropTypes.bool,
        allowNewSelection: React.PropTypes.bool,
        disabled: React.PropTypes.bool,
        styles: React.PropTypes.object,
        imageLoaded: React.PropTypes.function,
        beforeImageLoaded: React.PropTypes.function,
        imageLoadError: React.PropTypes.function,
        onDragStop: React.PropTypes.function
    },
    getDefaultProps() {
        return {
            width: 0,
            height: 0,
            selectionNatural: false,
            fixedRatio: true,
            allowNewSelection: true,
            rate: 1,
            originX: 0,
            originY: 0,
            styles: {},
            imageLoaded: function () {},
            beforeImageLoaded: function () {},
            imageLoadError: function () {},
            onDragStop: function() {}
        };
    },
    getInitialState() {
        let {originX, originY, width, height, selectionNatural, fixedRatio, allowNewSelection, rate, styles, imageLoaded, beforeImageLoaded, imageLoadError, onDragStop} = this.props;
        return {
            scale: 1.0,
            imageWidth: 400,
            imageHeight: 400,
            cropWidth: 0,
            cropHeight: 0,
            cropTop: 0,
            cropLeft: 0,
            originX,
            originY,
            dragStartX: 0,
            dragStartY: 0,
            fixedRatio,
            selectionNatural,
            allowNewSelection,
            frameWidth: width,
            frameHeight: fixedRatio ? (width / rate) : height,
            dragging: false,
            maxLeft: 0,
            maxTop: 0,
            action: null,
            imgLoaded: false,
            styles: deepExtend({}, defaultStyles, styles),
            imageLoaded,
            beforeImageLoaded,
            imageLoadError,
            onDragStop,
            moved: false,
            originalOriginX: originX,
            originalOriginY: originY,
            originalFrameWidth: width,
            originalFrameHeight: fixedRatio ? width / rate : height,
        };
    },

    initStyles() {
        let {originX, originY, rate} = this.props;
        const {imageWidth, imageHeight, fixedRatio, scale} = this.state;
        let {frameWidth, frameHeight} = this.state;

        if (frameWidth === 0 || frameHeight === 0) {
            frameWidth = Math.floor(imageWidth * 0.85);
            frameHeight = fixedRatio ? frameWidth / rate : Math.floor(imageHeight * 0.85);
            originX = Math.floor(frameWidth * 0.15);
            originY = Math.floor(frameHeight * 0.15);
        } else {
            frameWidth *= scale;
            frameHeight *= scale;
            originX *= scale;
            originY *= scale;
        }

        const maxLeft = imageWidth - frameWidth;
        const maxTop = imageHeight - frameHeight;

        if (originX + frameWidth >= imageWidth) {
            originX = imageWidth - frameWidth;
        }
        if (originY + frameHeight >= imageHeight) {
            originY = imageHeight - frameHeight;
        }

        this.setState({frameWidth, frameHeight, maxLeft, maxTop, originX, originY}, () => {
            this.calcPosition(frameWidth, frameHeight, originX, originY);
        });
    },

    calcPosition(width, height, left, top, move){
        const {imageWidth, imageHeight, fixedRatio} = this.state;
        const {rate} = this.props;

        if (width < 0 || height < 0) {
            return false;
        }

        if (fixedRatio) {
            if (width / imageWidth > height / imageHeight) {
                if (width > imageWidth) {
                    width = imageWidth;
                    left = 0;
                    if (fixedRatio) {
                        height = width / rate;
                    }
                }
            } else {
                if (height > imageHeight) {
                    height = imageHeight;
                    top = 0;
                    if (fixedRatio) {
                        width = height * rate;
                    }
                }
            }
        }

        if (width + left > imageWidth) {
            if (fixedRatio) {
                left = imageWidth - width;
            }
            else {
                width = width - ((width + left) - imageWidth);
            }
        }

        if (height + top > imageHeight) {
            if (fixedRatio) {
                top = imageHeight - height;
            }
            else {
                height = height - ((height + top) - imageHeight);
            }
        }

        if (left < 0) {
            if (!fixedRatio && !move) {
                width = width + left;
            }
            left = 0;
        }
        if (top < 0) {
            if (!fixedRatio && !move) {
                height = height + top;
            }
            top = 0;
        }

        if (width > imageWidth) {
            width = imageWidth;
        }
        if (height > imageHeight) {
            height = imageHeight;
        }

        this.setState({cropLeft: left, cropTop: top, cropWidth: width, cropHeight: height});
    },

    imgOnLoad(){
        const {imageLoaded} = this.state;
        this.setState({imgLoaded: true});
        imageLoaded();
    },

    imgOnError(proxy, error) {
        const {imageLoadError} = this.state;
        this.setState({imgLoaded: false});
        imageLoadError({error: "Error loading image"});
    },

    imgGetSizeBeforeLoad() {
        var that = this;
        setTimeout(function () {
            let img = ReactDOM.findDOMNode(that.refs.img);
            if (img && img.naturalWidth) {
                const {beforeImageLoaded} = that.state;

                let heightRatio = img.offsetHeight / img.naturalHeight;
                let widthRatio = img.offsetWidth / img.naturalWidth;

                let scale = Math.min(heightRatio, widthRatio);

                let height = parseInt(img.naturalHeight * scale);
                let width = parseInt(img.naturalWidth * scale);

                that.setState({
                    scale: scale,
                    imageWidth: width,
                    imageHeight: height
                }, () => that.initStyles());

                beforeImageLoaded();
            } else if (img) {
                console.log("waiting");
                that.imgGetSizeBeforeLoad();
            }
        }, 0);
    },

    //TODO Obsolete, remove
    createNewFrame(e){
        if (this.state.dragging) {
            const pageX = e.pageX ? e.pageX : e.targetTouches[0].pageX;
            const pageY = e.pageY ? e.pageY : e.targetTouches[0].pageY;
            const {rate} = this.props;
            const {frameWidth, frameHeight, dragStartX, dragStartY, offsetLeft, offsetTop, fixedRatio} = this.state;

            const _x = pageX - dragStartX;
            const _y = pageY - dragStartY;

            if (_x > 0) {
                if (_y < 0) {
                    return this.calcPosition(frameWidth + _x, fixedRatio ? ((frameWidth + _x) / rate) : (frameHeight - _y), offsetLeft, fixedRatio ? (offsetTop - _x / rate) : (offsetTop + _y));
                }
                return this.calcPosition(frameWidth + _x, fixedRatio ? ((frameWidth + _x) / rate) : (frameHeight + _y), offsetLeft, offsetTop);
            }
            if (_y > 0) {
                return this.calcPosition(frameWidth - _x, fixedRatio ? ((frameWidth - _x) / rate) : (frameHeight + _y), offsetLeft + _x, offsetTop);
            }

            return this.calcPosition(frameWidth - _x, fixedRatio ? ((frameWidth - _x) / rate) : (frameHeight - _y), offsetLeft + _x, fixedRatio ? (offsetTop + _x / rate) : (offsetTop + _y));
        }
    },

    handleDrag(e){
        if (this.state.dragging) {
            e.preventDefault();
            let {action} = this.state;
            if (!action) return this.createNewFrame(e);
            if (action == 'move') return this.frameMove(e);
            this.frameDotMove(action, e);
        }
    },

    frameMove(e){
        const {originX, originY, dragStartX, dragStartY, frameWidth, frameHeight, maxLeft, maxTop} = this.state;
        const pageX = e.pageX ? e.pageX : e.targetTouches[0].pageX;
        const pageY = e.pageY ? e.pageY : e.targetTouches[0].pageY;
        let _x = pageX - dragStartX + originX;
        let _y = pageY - dragStartY + originY;

        if (pageX < 0 || pageY < 0) {
            return false;
        }

        if ((pageX - dragStartX) > 0 || (pageY - dragStartY)) {
            this.setState({moved: true});
        }

        if (_x > maxLeft) _x = maxLeft;
        if (_y > maxTop) _y = maxTop;
        this.calcPosition(frameWidth, frameHeight, _x, _y, true);
    },

    handleDragStart(e) {
        const {allowNewSelection} = this.state;
        const action = e.target.getAttribute('data-action') ? e.target.getAttribute('data-action') : e.target.parentNode.getAttribute('data-action');
        const pageX = e.pageX ? e.pageX : e.targetTouches[0].pageX;
        const pageY = e.pageY ? e.pageY : e.targetTouches[0].pageY;
        if (action || allowNewSelection) {
            e.preventDefault();
            this.setState({
                dragStartX: pageX,
                dragStartY: pageY,
                dragging: true,
                action
            });
        }
        if (!action && allowNewSelection) {
            let container = ReactDOM.findDOMNode(this.refs.container);
            const {offsetLeft, offsetTop} = container;
            this.setState({
                offsetLeft: pageX - offsetLeft,
                offsetTop: pageY - offsetTop,
                frameWidth: 2,
                frameHeight: 2,
                moved: true
            }, () => {
                this.calcPosition(2, 2, pageX - offsetLeft, pageY - offsetTop);
            });
        }
    },

    handleDragStop(e){
        if (this.state.dragging) {
            e.preventDefault();
            const frameNode = ReactDOM.findDOMNode(this.refs.frameNode);
            const {offsetLeft, offsetTop, offsetWidth, offsetHeight} = frameNode;
            const {imageWidth, imageHeight, onDragStop} = this.state;
            this.setState({
                originX: offsetLeft,
                originY: offsetTop,
                dragging: false,
                frameWidth: offsetWidth,
                frameHeight: offsetHeight,
                maxLeft: imageWidth - offsetWidth,
                maxTop: imageHeight - offsetHeight,
                action: null
            }, function() {
                onDragStop(this.values());
            });
        }
    },

    componentDidMount(){
        document.addEventListener('mousemove', this.handleDrag);
        document.addEventListener('touchmove', this.handleDrag);

        document.addEventListener('mouseup', this.handleDragStop);
        document.addEventListener('touchend', this.handleDragStop);

        this.imgGetSizeBeforeLoad();
    },

    componentWillUnmount(){
        document.removeEventListener('mousemove', this.handleDrag);
        document.removeEventListener('touchmove', this.handleDrag);

        document.removeEventListener('mouseup', this.handleDragStop);
        document.removeEventListener('touchend', this.handleDragStop);
    },

    componentWillReceiveProps(newProps) {
        var width = this.props.width !== newProps.width;
        var height = this.props.height !== newProps.height;
        var originX = this.props.originX !== newProps.originX;
        var originY = this.props.originY !== newProps.originY;

        if (width || height || originX || originY) {

            let {scale} = this.state;

            this.setState({
                frameWidth: newProps.width * scale,
                frameHeight: newProps.height * scale,
                originX: newProps.originX * scale,
                originY: newProps.originY * scale,
                originalFrameWidth: newProps.width * scale,
                originalFrameHeight: newProps.height * scale,
                originalOriginX: newProps.originX * scale,
                originalOriginY: newProps.originY * scale
            }, () => {
                this.initStyles();
            });
        }
    },

    frameDotMove(dir, e){
        const pageX = e.pageX ? e.pageX : e.targetTouches[0].pageX;
        const pageY = e.pageY ? e.pageY : e.targetTouches[0].pageY;
        const {dragStartX, dragStartY, originX, originY, frameWidth, frameHeight, fixedRatio} = this.state;
        const {rate} = this.props;

        if (pageY !== 0 && pageX !== 0) {
            const _x = pageX - dragStartX;
            const _y = pageY - dragStartY;

            if ((pageX - dragStartX) > 0 || (pageY - dragStartY)) {
                this.setState({moved: true});
            }

            let new_width = frameWidth + _x;
            let new_height = fixedRatio ? new_width : (frameHeight + _y);

            switch (dir) {
                case 'ne':
                    new_height = frameHeight - _y;
                    return this.calcPosition(new_width, fixedRatio ? (new_width / rate) : new_height, originX, fixedRatio ? (originY - _x / rate) : (originY + _y));
                case 'e':
                    return this.calcPosition(new_width, fixedRatio ? (new_width / rate) : frameHeight, originX, fixedRatio ? (originY - _x / rate * 0.5) : originY);
                case 'se':
                    return this.calcPosition(new_width, fixedRatio ? (new_width / rate) : new_height, originX, originY);
                case 'n':
                    new_height = frameHeight - _y;
                    return this.calcPosition(fixedRatio ? (new_height * rate) : frameWidth, new_height, fixedRatio ? (originX + _y * rate * 0.5) : originX, originY + _y);
                case 'nw':
                    new_width = frameWidth - _x;
                    new_height = frameHeight - _y;
                    return this.calcPosition(new_width, fixedRatio ? (new_width / rate) : new_height, originX + _x, fixedRatio ? (originY + _x / rate) : (originY + _y));
                case 'w':
                    new_width = frameWidth - _x;
                    return this.calcPosition(new_width, fixedRatio ? (new_width / rate) : frameHeight, originX + _x, fixedRatio ? (originY + _x / rate * 0.5) : originY);
                case 'sw':
                    new_width = frameWidth - _x;
                    return this.calcPosition(new_width, fixedRatio ? (new_width / rate) : new_height, originX + _x, originY);
                case 's':
                    new_height = frameHeight + _y;
                    return this.calcPosition(fixedRatio ? (new_height * rate) : frameWidth, new_height, fixedRatio ? (originX - _y * rate * 0.5) : originX, originY);
                default:
                    return;
            }
        }
    },

    crop() {
        const {frameWidth, frameHeight, originX, originY, scale} = this.state;
        const canvas = document.createElement('canvas');
        const img = ReactDOM.findDOMNode(this.refs.img);
        const realWidth = frameWidth / scale;
        const realHeight = frameHeight / scale;
        canvas.width = realWidth;
        canvas.height = realHeight;

        canvas.getContext("2d").drawImage(img, originX / scale, originY / scale, realWidth, realHeight, 0, 0, realWidth, realHeight);
        return canvas.toDataURL();
    },

    values() {
        const {scale, frameWidth, frameHeight, originX, originY, selectionNatural, moved, originalOriginX, originalOriginY, originalFrameWidth, originalFrameHeight} = this.state;
        let _return = null;

        var thisOriginX = moved ? originX : originalOriginX;
        var thisOriginY = moved ? originY : originalOriginY;
        var thisFrameWidth = moved ? frameWidth : originalFrameWidth;
        var thisFrameHeight = moved ? frameHeight : originalFrameHeight;

        if (selectionNatural && moved) {
            const realWidth = parseInt(thisFrameWidth / scale);
            const realHeight = parseInt(thisFrameHeight / scale);
            const realX = parseInt(thisOriginX / scale);
            const realY = parseInt(thisOriginY / scale);
            _return = {width: realWidth, height: realHeight, x: realX, y: realY};
        } else {
            _return = {width: thisFrameWidth, height: thisFrameHeight, x: thisOriginX, y: thisOriginY};
        }

        return _return;
    },

    render() {
        const {dragging, imageHeight, imageWidth, imgLoaded} = this.state;
        const {src, disabled} = this.props;

        const imageNode = <div style={this.state.styles.source} ref="sourceNode">
            <img width={imageWidth} height={imageHeight}
                crossOrigin="anonymous"
                src={src}
                style={deepExtend({}, this.state.styles.img, this.state.styles.source_img)}
                ref='img'
                onLoad={this.imgOnLoad}
                onError={this.imgOnError}
            />
        </div>;

        let disabledStyle = disabled ? {display: 'none', cursor: 'initial'} : {};

        return (
            <div ref="container"
                 onMouseDown={disabled ? undefined : this.handleDragStart}
                 onTouchStart={disabled ? undefined : this.handleDragStart}
                 style={deepExtend({}, this.state.styles.container, {position: 'relative', height: imageHeight, width: imageWidth})}>
            {imageNode}
            {imgLoaded ?
                <div>
                    <div style={this.state.styles.modal}/>
                    <div style={
                        deepExtend({}, this.state.styles.frame,
                            dragging ? this.state.styles.dragging_frame : {},
                            {
                                display: 'block',
                                left: this.state.cropLeft,
                                top: this.state.cropTop,
                                width: this.state.cropWidth,
                                height: this.state.cropHeight
                            }
                        )} ref="frameNode">
                        <div style={this.state.styles.clone}>
                            <img ref="cloneImg" width={imageWidth} height={imageHeight} crossOrigin="anonymous" src={src}
                                style={deepExtend({}, this.state.styles.img, {marginLeft: -this.state.cropLeft, marginTop: -this.state.cropTop})}
                            />
                        </div>
                        <span style={deepExtend({}, this.state.styles.move, disabled ? {cursor: 'initial'} : {})} data-action='move'/>
                        <span style={deepExtend({}, this.state.styles.dot, this.state.styles.dotCenter, disabledStyle)} data-action='move'>
                           <span style={deepExtend({}, this.state.styles.dotInner, this.state.styles.dotInnerCenterVertical)}/>
                           <span style={deepExtend({}, this.state.styles.dotInner, this.state.styles.dotInnerCenterHorizontal)}/>
                        </span>
                        <span style={deepExtend({}, this.state.styles.dot, this.state.styles.dotNE)} data-action="ne">
                            <span style={deepExtend({}, this.state.styles.dotInner, this.state.styles.dotInnerNE, disabledStyle)}/>
                        </span>
                        <span style={deepExtend({}, this.state.styles.dot, this.state.styles.dotN)} data-action="n">
                            <span style={deepExtend({}, this.state.styles.dotInner, this.state.styles.dotInnerN, disabledStyle)}/>
                        </span>
                        <span style={deepExtend({}, this.state.styles.dot, this.state.styles.dotNW)} data-action="nw">
                            <span style={deepExtend({}, this.state.styles.dotInner, this.state.styles.dotInnerNW, disabledStyle)}/>
                        </span>
                        <span style={deepExtend({}, this.state.styles.dot, this.state.styles.dotE)} data-action="e">
                            <span style={deepExtend({}, this.state.styles.dotInner, this.state.styles.dotInnerE, disabledStyle)}/>
                        </span>
                        <span style={deepExtend({}, this.state.styles.dot, this.state.styles.dotW)} data-action="w">
                            <span style={deepExtend({}, this.state.styles.dotInner, this.state.styles.dotInnerW, disabledStyle)}/>
                        </span>
                        <span style={deepExtend({}, this.state.styles.dot, this.state.styles.dotSE)} data-action="se">
                            <span style={deepExtend({}, this.state.styles.dotInner, this.state.styles.dotInnerSE, disabledStyle)}/>
                        </span>
                        <span style={deepExtend({}, this.state.styles.dot, this.state.styles.dotS)} data-action="s">
                            <span style={deepExtend({}, this.state.styles.dotInner, this.state.styles.dotInnerS, disabledStyle)}/>
                        </span>
                        <span style={deepExtend({}, this.state.styles.dot, this.state.styles.dotSW)} data-action="sw">
                            <span style={deepExtend({}, this.state.styles.dotInner, this.state.styles.dotInnerSW, disabledStyle)}/>
                        </span>
                        <span style={deepExtend({}, this.state.styles.line, this.state.styles.lineN, disabledStyle)} data-action="n"/>
                        <span style={deepExtend({}, this.state.styles.line, this.state.styles.lineS, disabledStyle)} data-action="s"/>
                        <span style={deepExtend({}, this.state.styles.line, this.state.styles.lineW, disabledStyle)} data-action="w"/>
                        <span style={deepExtend({}, this.state.styles.line, this.state.styles.lineE, disabledStyle)} data-action="e"/>
                    </div>
                </div>
                :
                null
            }
        </div>);
    }
});

var defaultStyles = {
    container: {},
    img: {
        userDrag: 'none',
        userSelect: 'none',
        MozUserSelect: 'none',
        WebkitUserDrag: 'none',
        WebkitUserSelect: 'none',
        WebkitTransform: 'translateZ(0)',
        WebkitPerspective: 1000,
        WebkitBackfaceVisibility: 'hidden'
    },
    clone: {
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        position: 'absolute',
        left: 0,
        top: 0
    },
    frame: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        right: 0,
        display: 'none'
    },
    dragging_frame: {
        opacity: .8
    },
    source: {
        overflow: 'hidden'
    },
    source_img: {
        float: 'left'
    },
    modal: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        right: 0,
        opacity: .4,
        backgroundColor: '#222'
    },
    modal_disabled: {
        opacity: 0
    },
    move: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        right: 0,
        cursor: 'move',
        outline: '1px dashed #88f',
        backgroundColor: 'transparent'
    },
    dot: {
        zIndex: 10
    },
    dotN: {
        cursor: 'n-resize'
    },
    dotS: {
        cursor: 's-resize'
    },
    dotE: {
        cursor: 'e-resize'
    },
    dotW: {
        cursor: 'w-resize'
    },
    dotNW: {
        cursor: 'nw-resize'
    },
    dotNE: {
        cursor: 'ne-resize'
    },
    dotSW: {
        cursor: 'sw-resize'
    },
    dotSE: {
        cursor: 'se-resize'
    },
    dotCenter: {
        backgroundColor: 'transparent',
        cursor: 'move'
    },
    dotInner: {
        border: '1px solid #88f',
        background: '#fff',
        display: 'block',
        width: 6,
        height: 6,
        padding: 0,
        margin: 0,
        position: 'absolute'
    },
    dotInnerN: {
        top: -4,
        left: '50%',
        marginLeft: -4
    },
    dotInnerS: {
        bottom: -4,
        left: '50%',
        marginLeft: -4
    },
    dotInnerE: {
        right: -4,
        top: '50%',
        marginTop: -4
    },
    dotInnerW: {
        left: -4,
        top: '50%',
        marginTop: -4
    },
    dotInnerNE: {
        top: -4,
        right: -4
    },
    dotInnerSE: {
        bottom: -4,
        right: -4
    },
    dotInnerNW: {
        top: -4,
        left: -4
    },
    dotInnerSW: {
        bottom: -4,
        left: -4
    },
    dotInnerCenterVertical: {
        position: 'absolute',
        border: 'none',
        width: 2,
        height: 8,
        backgroundColor: '#88f',
        top: '50%',
        left: '50%',
        marginLeft: -1,
        marginTop: -4,
    },
    dotInnerCenterHorizontal: {
        position: 'absolute',
        border: 'none',
        width: 8,
        height: 2,
        backgroundColor: '#88f',
        top: '50%',
        left: '50%',
        marginLeft: -4,
        marginTop: -1
    },
    line: {
        position: 'absolute',
        display: 'block',
        zIndex: 100
    },
    lineS: {
        cursor: 's-resize',
        bottom: 0,
        left: 0,
        width: '100%',
        height: 4,
        background: 'transparent'
    },
    lineN: {
        cursor: 'n-resize',
        top: 0,
        left: 0,
        width: '100%',
        height: 4,
        background: 'transparent'
    },
    lineE: {
        cursor: 'e-resize',
        right: 0,
        top: 0,
        width: 4,
        height: '100%',
        background: 'transparent'
    },
    lineW: {
        cursor: 'w-resize',
        left: 0,
        top: 0,
        width: 4,
        height: '100%',
        background: 'transparent'
    }
};

module.exports = Cropper;
