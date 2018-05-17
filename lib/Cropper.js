'use strict';

var React = require('react');
var ReactDOM = require('react-dom');
var deepExtend = require('deep-extend');

var Cropper = React.createClass({
    displayName: 'Cropper',

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
    getDefaultProps: function getDefaultProps() {
        return {
            width: 200,
            height: 200,
            selectionNatural: false,
            fixedRatio: true,
            allowNewSelection: true,
            rate: 1,
            originX: 0,
            originY: 0,
            styles: {},
            imageLoaded: function imageLoaded() {},
            beforeImageLoaded: function beforeImageLoaded() {},
            imageLoadError: function imageLoadError() {},
            onDragStop: function onDragStop() {}
        };
    },
    getInitialState: function getInitialState() {
        var _props = this.props,
            originX = _props.originX,
            originY = _props.originY,
            width = _props.width,
            height = _props.height,
            selectionNatural = _props.selectionNatural,
            fixedRatio = _props.fixedRatio,
            allowNewSelection = _props.allowNewSelection,
            rate = _props.rate,
            styles = _props.styles,
            imageLoaded = _props.imageLoaded,
            beforeImageLoaded = _props.beforeImageLoaded,
            imageLoadError = _props.imageLoadError,
            onDragStop = _props.onDragStop;

        return {
            scale: 1.0,
            imageWidth: 200,
            imageHeight: 200,
            cropWidth: 200,
            cropHeight: 200,
            cropTop: 0,
            cropLeft: 0,
            originX: originX,
            originY: originY,
            dragStartX: 0,
            dragStartY: 0,
            fixedRatio: fixedRatio,
            selectionNatural: selectionNatural,
            allowNewSelection: allowNewSelection,
            frameWidth: width,
            frameHeight: fixedRatio ? width / rate : height,
            dragging: false,
            maxLeft: 0,
            maxTop: 0,
            action: null,
            imgLoaded: false,
            styles: deepExtend({}, defaultStyles, styles),
            imageLoaded: imageLoaded,
            beforeImageLoaded: beforeImageLoaded,
            imageLoadError: imageLoadError,
            onDragStop: onDragStop,
            moved: false,
            originalOriginX: originX,
            originalOriginY: originY,
            originalFrameWidth: width,
            originalFrameHeight: fixedRatio ? width / rate : height
        };
    },
    initStyles: function initStyles() {
        var _props2 = this.props,
            originX = _props2.originX,
            originY = _props2.originY;
        var _state = this.state,
            imageWidth = _state.imageWidth,
            imageHeight = _state.imageHeight;
        var _state2 = this.state,
            frameWidth = _state2.frameWidth,
            frameHeight = _state2.frameHeight;


        var maxLeft = imageWidth - frameWidth;
        var maxTop = imageHeight - frameHeight;

        if (originX + frameWidth >= imageWidth) {
            originX = imageWidth - frameWidth;
        }
        if (originY + frameHeight >= imageHeight) {
            originY = imageHeight - frameHeight;
        }

        this.setState({ maxLeft: maxLeft, maxTop: maxTop, originX: originX, originY: originY });
        this.calcPosition(frameWidth, frameHeight, originX, originY);
    },
    calcPosition: function calcPosition(width, height, left, top, move) {
        var _state3 = this.state,
            imageWidth = _state3.imageWidth,
            imageHeight = _state3.imageHeight,
            fixedRatio = _state3.fixedRatio;
        var rate = this.props.rate;


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
            } else {
                width = width - (width + left - imageWidth);
            }
        }

        if (height + top > imageHeight) {
            if (fixedRatio) {
                top = imageHeight - height;
            } else {
                height = height - (height + top - imageHeight);
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

        this.setState({ cropLeft: left, cropTop: top, cropWidth: width, cropHeight: height });
    },
    imgOnLoad: function imgOnLoad() {
        var imageLoaded = this.state.imageLoaded;

        this.setState({ imgLoaded: true });
        imageLoaded();
    },
    imgOnError: function imgOnError(proxy, error) {
        var imageLoadError = this.state.imageLoadError;

        this.setState({ imgLoaded: false });
        imageLoadError({ error: "Error loading image" });
    },
    imgGetSizeBeforeLoad: function imgGetSizeBeforeLoad() {
        var that = this;
        setTimeout(function () {
            var img = ReactDOM.findDOMNode(that.refs.img);
            if (img && img.naturalWidth) {
                var beforeImageLoaded = that.state.beforeImageLoaded;


                var heightRatio = img.offsetHeight / img.naturalHeight;
                var widthRatio = img.offsetWidth / img.naturalWidth;

                var scale = Math.min(heightRatio, widthRatio);

                var height = parseInt(img.naturalHeight * scale);
                var width = parseInt(img.naturalWidth * scale);

                that.setState({
                    scale: scale,
                    imageWidth: width,
                    imageHeight: height
                }, function () {
                    return that.initStyles();
                });

                beforeImageLoaded();
            } else if (img) {
                console.log("waiting");
                that.imgGetSizeBeforeLoad();
            }
        }, 0);
    },


    //TODO Obsolete, remove
    createNewFrame: function createNewFrame(e) {
        if (this.state.dragging) {
            var pageX = e.pageX ? e.pageX : e.targetTouches[0].pageX;
            var pageY = e.pageY ? e.pageY : e.targetTouches[0].pageY;
            var rate = this.props.rate;
            var _state4 = this.state,
                frameWidth = _state4.frameWidth,
                frameHeight = _state4.frameHeight,
                dragStartX = _state4.dragStartX,
                dragStartY = _state4.dragStartY,
                offsetLeft = _state4.offsetLeft,
                offsetTop = _state4.offsetTop,
                fixedRatio = _state4.fixedRatio;


            var _x = pageX - dragStartX;
            var _y = pageY - dragStartY;

            if (_x > 0) {
                if (_y < 0) {
                    return this.calcPosition(frameWidth + _x, fixedRatio ? (frameWidth + _x) / rate : frameHeight - _y, offsetLeft, fixedRatio ? offsetTop - _x / rate : offsetTop + _y);
                }
                return this.calcPosition(frameWidth + _x, fixedRatio ? (frameWidth + _x) / rate : frameHeight + _y, offsetLeft, offsetTop);
            }
            if (_y > 0) {
                return this.calcPosition(frameWidth - _x, fixedRatio ? (frameWidth - _x) / rate : frameHeight + _y, offsetLeft + _x, offsetTop);
            }

            return this.calcPosition(frameWidth - _x, fixedRatio ? (frameWidth - _x) / rate : frameHeight - _y, offsetLeft + _x, fixedRatio ? offsetTop + _x / rate : offsetTop + _y);
        }
    },
    handleDrag: function handleDrag(e) {
        if (this.state.dragging) {
            e.preventDefault();
            var action = this.state.action;

            if (!action) return this.createNewFrame(e);
            if (action == 'move') return this.frameMove(e);
            this.frameDotMove(action, e);
        }
    },
    frameMove: function frameMove(e) {
        var _state5 = this.state,
            originX = _state5.originX,
            originY = _state5.originY,
            dragStartX = _state5.dragStartX,
            dragStartY = _state5.dragStartY,
            frameWidth = _state5.frameWidth,
            frameHeight = _state5.frameHeight,
            maxLeft = _state5.maxLeft,
            maxTop = _state5.maxTop;

        var pageX = e.pageX ? e.pageX : e.targetTouches[0].pageX;
        var pageY = e.pageY ? e.pageY : e.targetTouches[0].pageY;
        var _x = pageX - dragStartX + originX;
        var _y = pageY - dragStartY + originY;

        if (pageX < 0 || pageY < 0) {
            return false;
        }

        if (pageX - dragStartX > 0 || pageY - dragStartY) {
            this.setState({ moved: true });
        }

        if (_x > maxLeft) _x = maxLeft;
        if (_y > maxTop) _y = maxTop;
        this.calcPosition(frameWidth, frameHeight, _x, _y, true);
    },
    handleDragStart: function handleDragStart(e) {
        var _this = this;

        var allowNewSelection = this.state.allowNewSelection;

        var action = e.target.getAttribute('data-action') ? e.target.getAttribute('data-action') : e.target.parentNode.getAttribute('data-action');
        var pageX = e.pageX ? e.pageX : e.targetTouches[0].pageX;
        var pageY = e.pageY ? e.pageY : e.targetTouches[0].pageY;
        if (action || allowNewSelection) {
            e.preventDefault();
            this.setState({
                dragStartX: pageX,
                dragStartY: pageY,
                dragging: true,
                action: action
            });
        }
        if (!action && allowNewSelection) {
            var container = ReactDOM.findDOMNode(this.refs.container);
            var offsetLeft = container.offsetLeft,
                offsetTop = container.offsetTop;

            this.setState({
                offsetLeft: pageX - offsetLeft,
                offsetTop: pageY - offsetTop,
                frameWidth: 2,
                frameHeight: 2,
                moved: true
            }, function () {
                _this.calcPosition(2, 2, pageX - offsetLeft, pageY - offsetTop);
            });
        }
    },
    handleDragStop: function handleDragStop(e) {
        if (this.state.dragging) {
            e.preventDefault();
            var frameNode = ReactDOM.findDOMNode(this.refs.frameNode);
            var offsetLeft = frameNode.offsetLeft,
                offsetTop = frameNode.offsetTop,
                offsetWidth = frameNode.offsetWidth,
                offsetHeight = frameNode.offsetHeight;
            var _state6 = this.state,
                imageWidth = _state6.imageWidth,
                imageHeight = _state6.imageHeight,
                onDragStop = _state6.onDragStop;

            this.setState({
                originX: offsetLeft,
                originY: offsetTop,
                dragging: false,
                frameWidth: offsetWidth,
                frameHeight: offsetHeight,
                maxLeft: imageWidth - offsetWidth,
                maxTop: imageHeight - offsetHeight,
                action: null
            }, function () {
                onDragStop(this.values());
            });
        }
    },
    componentDidMount: function componentDidMount() {
        document.addEventListener('mousemove', this.handleDrag);
        document.addEventListener('touchmove', this.handleDrag);

        document.addEventListener('mouseup', this.handleDragStop);
        document.addEventListener('touchend', this.handleDragStop);

        this.imgGetSizeBeforeLoad();
    },
    componentWillUnmount: function componentWillUnmount() {
        document.removeEventListener('mousemove', this.handleDrag);
        document.removeEventListener('touchmove', this.handleDrag);

        document.removeEventListener('mouseup', this.handleDragStop);
        document.removeEventListener('touchend', this.handleDragStop);
    },
    componentWillReceiveProps: function componentWillReceiveProps(newProps) {
        var _this2 = this;

        var width = this.props.width !== newProps.width;
        var height = this.props.height !== newProps.height;
        var originX = this.props.originX !== newProps.originX;
        var originY = this.props.originY !== newProps.originY;

        if (width || height || originX || originY) {
            this.setState({
                frameWidth: newProps.width,
                frameHeight: newProps.height,
                originX: newProps.originX,
                originY: newProps.originY,
                originalFrameWidth: newProps.width,
                originalFrameHeight: newProps.height,
                originalOriginX: newProps.originX,
                originalOriginY: newProps.originY
            }, function () {
                _this2.initStyles();
            });
        }
    },
    frameDotMove: function frameDotMove(dir, e) {
        var pageX = e.pageX ? e.pageX : e.targetTouches[0].pageX;
        var pageY = e.pageY ? e.pageY : e.targetTouches[0].pageY;
        var _state7 = this.state,
            dragStartX = _state7.dragStartX,
            dragStartY = _state7.dragStartY,
            originX = _state7.originX,
            originY = _state7.originY,
            frameWidth = _state7.frameWidth,
            frameHeight = _state7.frameHeight,
            fixedRatio = _state7.fixedRatio;
        var rate = this.props.rate;


        if (pageY !== 0 && pageX !== 0) {
            var _x = pageX - dragStartX;
            var _y = pageY - dragStartY;

            if (pageX - dragStartX > 0 || pageY - dragStartY) {
                this.setState({ moved: true });
            }

            var new_width = frameWidth + _x;
            var new_height = fixedRatio ? new_width : frameHeight + _y;

            switch (dir) {
                case 'ne':
                    new_height = frameHeight - _y;
                    return this.calcPosition(new_width, fixedRatio ? new_width / rate : new_height, originX, fixedRatio ? originY - _x / rate : originY + _y);
                case 'e':
                    return this.calcPosition(new_width, fixedRatio ? new_width / rate : frameHeight, originX, fixedRatio ? originY - _x / rate * 0.5 : originY);
                case 'se':
                    return this.calcPosition(new_width, fixedRatio ? new_width / rate : new_height, originX, originY);
                case 'n':
                    new_height = frameHeight - _y;
                    return this.calcPosition(fixedRatio ? new_height * rate : frameWidth, new_height, fixedRatio ? originX + _y * rate * 0.5 : originX, originY + _y);
                case 'nw':
                    new_width = frameWidth - _x;
                    new_height = frameHeight - _y;
                    return this.calcPosition(new_width, fixedRatio ? new_width / rate : new_height, originX + _x, fixedRatio ? originY + _x / rate : originY + _y);
                case 'w':
                    new_width = frameWidth - _x;
                    return this.calcPosition(new_width, fixedRatio ? new_width / rate : frameHeight, originX + _x, fixedRatio ? originY + _x / rate * 0.5 : originY);
                case 'sw':
                    new_width = frameWidth - _x;
                    return this.calcPosition(new_width, fixedRatio ? new_width / rate : new_height, originX + _x, originY);
                case 's':
                    new_height = frameHeight + _y;
                    return this.calcPosition(fixedRatio ? new_height * rate : frameWidth, new_height, fixedRatio ? originX - _y * rate * 0.5 : originX, originY);
                default:
                    return;
            }
        }
    },
    crop: function crop() {
        var _state8 = this.state,
            frameWidth = _state8.frameWidth,
            frameHeight = _state8.frameHeight,
            originX = _state8.originX,
            originY = _state8.originY,
            scale = _state8.scale;

        var canvas = document.createElement('canvas');
        var img = ReactDOM.findDOMNode(this.refs.img);
        var realWidth = frameWidth / scale;
        var realHeight = frameHeight / scale;
        canvas.width = realWidth;
        canvas.height = realHeight;

        canvas.getContext("2d").drawImage(img, originX / scale, originY / scale, realWidth, realHeight, 0, 0, realWidth, realHeight);
        return canvas.toDataURL();
    },
    values: function values() {
        var _state9 = this.state,
            scale = _state9.scale,
            frameWidth = _state9.frameWidth,
            frameHeight = _state9.frameHeight,
            originX = _state9.originX,
            originY = _state9.originY,
            selectionNatural = _state9.selectionNatural,
            moved = _state9.moved,
            originalOriginX = _state9.originalOriginX,
            originalOriginY = _state9.originalOriginY,
            originalFrameWidth = _state9.originalFrameWidth,
            originalFrameHeight = _state9.originalFrameHeight;

        var _return = null;

        var thisOriginX = moved ? originX : originalOriginX;
        var thisOriginY = moved ? originY : originalOriginY;
        var thisFrameWidth = moved ? frameWidth : originalFrameWidth;
        var thisFrameHeight = moved ? frameHeight : originalFrameHeight;

        if (selectionNatural && moved) {
            var realWidth = parseInt(thisFrameWidth / scale);
            var realHeight = parseInt(thisFrameHeight / scale);
            var realX = parseInt(thisOriginX / scale);
            var realY = parseInt(thisOriginY / scale);
            _return = { width: realWidth, height: realHeight, x: realX, y: realY };
        } else {
            _return = { width: thisFrameWidth, height: thisFrameHeight, x: thisOriginX, y: thisOriginY };
        }

        return _return;
    },
    render: function render() {
        var _state10 = this.state,
            dragging = _state10.dragging,
            imageHeight = _state10.imageHeight,
            imageWidth = _state10.imageWidth,
            imgLoaded = _state10.imgLoaded;
        var _props3 = this.props,
            src = _props3.src,
            disabled = _props3.disabled;


        var imageNode = React.createElement(
            'div',
            { style: this.state.styles.source, ref: 'sourceNode' },
            React.createElement('img', { width: imageWidth, height: imageHeight,
                crossOrigin: 'anonymous',
                src: src,
                style: deepExtend({}, this.state.styles.img, this.state.styles.source_img),
                ref: 'img',
                onLoad: this.imgOnLoad,
                onError: this.imgOnError
            })
        );

        var disabledStyle = disabled ? { display: 'none', cursor: 'initial' } : {};

        return React.createElement(
            'div',
            { ref: 'container',
                onMouseDown: disabled ? undefined : this.handleDragStart,
                onTouchStart: disabled ? undefined : this.handleDragStart,
                style: deepExtend({}, this.state.styles.container, { position: 'relative', height: imageHeight }) },
            imageNode,
            imgLoaded ? React.createElement(
                'div',
                null,
                React.createElement('div', { style: this.state.styles.modal }),
                React.createElement(
                    'div',
                    { style: deepExtend({}, this.state.styles.frame, dragging ? this.state.styles.dragging_frame : {}, {
                            display: 'block',
                            left: this.state.cropLeft,
                            top: this.state.cropTop,
                            width: this.state.cropWidth,
                            height: this.state.cropHeight
                        }), ref: 'frameNode' },
                    React.createElement(
                        'div',
                        { style: this.state.styles.clone },
                        React.createElement('img', { ref: 'cloneImg', width: imageWidth, height: imageHeight, crossOrigin: 'anonymous', src: src,
                            style: deepExtend({}, this.state.styles.img, { marginLeft: -this.state.cropLeft, marginTop: -this.state.cropTop })
                        })
                    ),
                    React.createElement('span', { style: deepExtend({}, this.state.styles.move, disabled ? { cursor: 'initial' } : {}), 'data-action': 'move' }),
                    React.createElement(
                        'span',
                        { style: deepExtend({}, this.state.styles.dot, this.state.styles.dotCenter, disabledStyle), 'data-action': 'move' },
                        React.createElement('span', { style: deepExtend({}, this.state.styles.dotInner, this.state.styles.dotInnerCenterVertical) }),
                        React.createElement('span', { style: deepExtend({}, this.state.styles.dotInner, this.state.styles.dotInnerCenterHorizontal) })
                    ),
                    React.createElement(
                        'span',
                        { style: deepExtend({}, this.state.styles.dot, this.state.styles.dotNE), 'data-action': 'ne' },
                        React.createElement('span', { style: deepExtend({}, this.state.styles.dotInner, this.state.styles.dotInnerNE, disabledStyle) })
                    ),
                    React.createElement(
                        'span',
                        { style: deepExtend({}, this.state.styles.dot, this.state.styles.dotN), 'data-action': 'n' },
                        React.createElement('span', { style: deepExtend({}, this.state.styles.dotInner, this.state.styles.dotInnerN, disabledStyle) })
                    ),
                    React.createElement(
                        'span',
                        { style: deepExtend({}, this.state.styles.dot, this.state.styles.dotNW), 'data-action': 'nw' },
                        React.createElement('span', { style: deepExtend({}, this.state.styles.dotInner, this.state.styles.dotInnerNW, disabledStyle) })
                    ),
                    React.createElement(
                        'span',
                        { style: deepExtend({}, this.state.styles.dot, this.state.styles.dotE), 'data-action': 'e' },
                        React.createElement('span', { style: deepExtend({}, this.state.styles.dotInner, this.state.styles.dotInnerE, disabledStyle) })
                    ),
                    React.createElement(
                        'span',
                        { style: deepExtend({}, this.state.styles.dot, this.state.styles.dotW), 'data-action': 'w' },
                        React.createElement('span', { style: deepExtend({}, this.state.styles.dotInner, this.state.styles.dotInnerW, disabledStyle) })
                    ),
                    React.createElement(
                        'span',
                        { style: deepExtend({}, this.state.styles.dot, this.state.styles.dotSE), 'data-action': 'se' },
                        React.createElement('span', { style: deepExtend({}, this.state.styles.dotInner, this.state.styles.dotInnerSE, disabledStyle) })
                    ),
                    React.createElement(
                        'span',
                        { style: deepExtend({}, this.state.styles.dot, this.state.styles.dotS), 'data-action': 's' },
                        React.createElement('span', { style: deepExtend({}, this.state.styles.dotInner, this.state.styles.dotInnerS, disabledStyle) })
                    ),
                    React.createElement(
                        'span',
                        { style: deepExtend({}, this.state.styles.dot, this.state.styles.dotSW), 'data-action': 'sw' },
                        React.createElement('span', { style: deepExtend({}, this.state.styles.dotInner, this.state.styles.dotInnerSW, disabledStyle) })
                    ),
                    React.createElement('span', { style: deepExtend({}, this.state.styles.line, this.state.styles.lineN, disabledStyle), 'data-action': 'n' }),
                    React.createElement('span', { style: deepExtend({}, this.state.styles.line, this.state.styles.lineS, disabledStyle), 'data-action': 's' }),
                    React.createElement('span', { style: deepExtend({}, this.state.styles.line, this.state.styles.lineW, disabledStyle), 'data-action': 'w' }),
                    React.createElement('span', { style: deepExtend({}, this.state.styles.line, this.state.styles.lineE, disabledStyle), 'data-action': 'e' })
                )
            ) : null
        );
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
        marginTop: -4
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