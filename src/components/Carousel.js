import React, {Component} from 'react';
import Hammer from 'rc-hammerjs';
import util from '../utils/CarouselUtil';
import CarouselSlide from './CarouselSlide';
import './Carousel.css';

const transitionDuration = 250;

class Carousel extends Component {
    static defaultProps = {
        maxOverlayOpacity: 0.6
    }

    constructor(props) {
        super(props);

        const width = 0;
        const height = 0;
        const {index, renderedIndices} = this.props;
        const slidesData = this.getSlidesData();
        const x = this.getX({slidesData, width, index, renderedIndices});
        this.state = {
            height,
            width,
            slidesData,
            sliding: false,
            panning: false,
            panAxis: '',
            x,
            xBeforePan: x
        };

        this.timeouts = {};
    }

    componentDidMount() {
        const {height, width} = this.getCarouselSize();
        const {index, renderedIndices} = this.props;
        
        if (height !== this.state.height || width !== this.state.width) {
            const slidesData = this.getSlidesData(height, width);
            this.setState({
                height,
                width,
                slidesData,
                x: this.getX({slidesData, width, index, renderedIndices})
            });
        }

        if (typeof window !== 'undefined') {
            window.addEventListener('resize', this.onResize);
        }
    }

    componentWillReceiveProps(nextProps) {
        const {index} = this.props;
        const {slidesData, width, x} = this.state;
        if (nextProps.index !== index) {
            const x = this.getX({slidesData, width, index: nextProps.index, renderedIndices: nextProps.renderedIndices});
            this.setState({
                x,
                xBeforePan: x,
                sliding: false
            })
        }
    }

    componentWillUnmount() {
        if (typeof window !== 'undefined') {
            window.removeEventListener('resize', this.onResize);
        }
    }

    getX({slidesData, width, index, renderedIndices}) {
        const indexOfIndex = renderedIndices.indexOf(index);
        const posIndices = renderedIndices.slice(0, indexOfIndex);
        const dist = posIndices.reduce((accum, curVal) => {
            const d = slidesData[curVal].width;
            return d + accum;
        }, 0);
        const margin = util.getSlideMargin(width, slidesData[index].width);        
        return dist - margin;;
    }

    getSlidesData(carouselHeight = 0, carouselWidth = 0) {
        const {slideSize, images} = this.props;
        return images.map((image, i) => {
            const size = util.getSlideSize({
                carouselHeight,
                carouselWidth,
                imageHeight: image.height,
                imageWidth: image.width,
                slideSize
            });
            return size;
        });
    }
    
    onResize = () => {
        this.resize(this.getCarouselHeight, this.getCarouselWidth())
    }

    resize = (newHeight, newWidth) => {
        const {height, width, slidesData} = this.state;
        
        if (newHeight !== height || newWidth !== width) {
            const {index, renderedIndices} = this.props;
            const x = this.getX({slidesData, width: newWidth, index, renderedIndices});
            this.setState({
                height: newHeight,
                width: newWidth,
                x,
                xBeforePan: x
            });
        }
    }

    onPrev = () => {
        this.slide(false, this.props.onPrev);
    }

    onNext = () => {
        this.slide(true, this.props.onNext);
    }

    setElemsStyles(list) { // list item: {elem, prop, value}
        const filteredList = list.filter((item) => {
            const {elem, prop} = item;
            return elem && elem.style && prop
        });
        requestAnimationFrame(() => {
            filteredList.map((item) => {
                const {elem, prop, value} = item;
                elem.style[prop] = value;
            });
        });
    }

    updateOverlayOpacity({isNext, reset, clearAll = false}) {
        if (this.props.maxOverlayOpacity > 0) {
            if (clearAll) {
                this.setElemsStyles([
                    {elem: this['slide-overlay-current'], prop: 'opacity', value: ''},
                    {elem: this['slide-overlay-prev'], prop: 'opacity', value: ''},
                    {elem: this['slide-overlay-next'], prop: 'opacity', value: ''},
                ]);
            } else if (reset) {
                this.setElemsStyles([
                    {elem: this['slide-overlay-current'], prop: 'opacity', value: 0},
                    {elem: this['slide-overlay-prev'], prop: 'opacity', value: 1},
                    {elem: this['slide-overlay-next'], prop: 'opacity', value: 1},
                ]);
            } else if (isNext) {
                this.setElemsStyles([
                    {elem: this['slide-overlay-current'], prop: 'opacity', value: 1},
                    {elem: this['slide-overlay-prev'], prop: 'opacity', value: 1},
                    {elem: this['slide-overlay-next'], prop: 'opacity', value: 0},
                ]);
            } else {
                this.setElemsStyles([
                    {elem: this['slide-overlay-current'], prop: 'opacity', value: 1},
                    {elem: this['slide-overlay-prev'], prop: 'opacity', value: 0},
                    {elem: this['slide-overlay-next'], prop: 'opacity', value: 1},
                ]);
            }
        }
    }

    getCarouselSize = () => {
        return {
            width: this.getCarouselWidth(),
            height: this.getCarouselHeight()
        }
    }

    getCarouselHeight = (height = 0) => {
        if (height) {
            return height;
        }
        return this.carousel
            ? this.carousel.clientHeight || this.carousel.getBoundingClientRect().height
            : this.state.height;
    }

    getCarouselWidth = (width = 0) => {
        if (width) {
            return width;
        }
        return this.carousel
            ? this.carousel.clientWidth || this.carousel.getBoundingClientRect().width
            : this.state.width;
    }

    getSlideStyle(index, data) {
        const {renderedIndices} = this.props;
        const {slidesData} = this.state;
        const length = this.props.images.length;
        const indexOfIndex = renderedIndices.indexOf(index);
        let order = indexOfIndex;
        if (order < 0) {
            order = index + length;
        }
        return {
            order,
            width: `${slidesData[index].width}px`,
            height: `${slidesData[index].height}px`,
            backgroundColor: data.backgroundColor,
            visibility: indexOfIndex < 0 ? 'hidden' : ''
        };
    }

    getSetSlideRef = ({label} = {}) => ((ref) => {
        if (label) {
            if (ref) {
                this[`slide-overlay-${label}`] = ref.querySelector('.CarouselSlide__overlay');
            } else {
                this[`slide-overlay-${label}`] = null;
            }
        }
    })

    renderSlides() {
        const {images, renderedIndices, index, maxOverlayOpacity} = this.props;
        const {width, height, slidesData, sliding, panning} = this.state;
        const nextIndex = util.getIndex(index, images.length, true);
        const prevIndex = util.getIndex(index, images.length, false);
        return images.map((image, i) => {
            const shouldRender = renderedIndices.indexOf(i) > -1;
            const positionFlags = util.getPositionFlags({shouldRender, i, index, prevIndex, nextIndex});
            const setSlideRef = shouldRender && maxOverlayOpacity > 0 ? this.getSetSlideRef(positionFlags) : undefined
            return (
                <CarouselSlide
                    setSlideRef={setSlideRef}
                    {...slidesData[i]}
                    {...positionFlags}
                    key= {`slide_${i}`}
                    index={i}
                    carouselHeight={height}
                    carouselWidth={width}
                    slideStyle={this.getSlideStyle(i, image)}
                    shouldRender={shouldRender}
                    url={image.url}
                    panning={panning}
                    sliding={sliding}
                />
            );
        });
    }

    onPanStart = (e) => {
        const {direction, deltaX, deltaY} = e;
        const {panning, x, sliding} = this.state;
        const horz = [2, 4];
        const xBeforePan = x;
        if (!sliding && !panning && horz.indexOf(direction) > -1 && Math.abs(deltaY) < 60) {
            this.setState({
                panning: true,
                panAxis: 'horz',
                xBeforePan,
                x: xBeforePan - deltaX
            });
        }
    }

    onPan = (e) => {
        const {additionalEvent, deltaX, deltaY} = e;
        const {panning, panAxis, xBeforePan} = this.state;
        const addE = ['panright', 'panleft'];
        if (panAxis === 'horz' && addE.indexOf(additionalEvent) > -1 && Math.abs(deltaY) < 60) {
            this.updateOverlayOpacityOnPan(deltaX);
            this.setState({
                panning: true,
                panAxis: 'horz',
                x: xBeforePan - deltaX
            });
        }
    }

    onPanEnd = (e) => {
        this.onPanStopped(e, 'end');
    }

    onPanCancel = (e) => {
        this.onPanStopped(e, 'cancel');
    }

    onPanStopped(e, from) {
        const {deltaX, deltaY} = e;
        const threshold = 30;
        if (deltaX > threshold) {
            this.onPrev();
        } else if (deltaX < -threshold) {
            this.onNext();
        } else {
            this.slide(null, null, true);
        }
    }

    updateOverlayOpacityOnPan(deltaX) {
        const mult = 2;
        const {index, images} = this.props;
        const {slidesData, width} = this.state;
        const panPct = util.getPanPercent({
            carouselWidth: width,
            slidesData,
            index,
            length: images.length,
            deltaX
        }) * mult;
        const goingPct = util.normalize(panPct);
        const comingPct = util.normalize((1 - panPct));
        if (deltaX < 0) {
            this.setElemsStyles([
                {elem: this['slide-overlay-current'], prop: 'opacity', value: goingPct},
                {elem: this['slide-overlay-next'], prop: 'opacity', value: comingPct},
            ]);
        } else {
            this.setElemsStyles([
                {elem: this['slide-overlay-current'], prop: 'opacity', value: goingPct},
                {elem: this['slide-overlay-prev'], prop: 'opacity', value: comingPct},
            ]);
        }
    }

    slide(next, callback, reset) {
        if (this.viewbox) {
            let x = this.state.xBeforePan;
            if (!reset) {
                const {index, renderedIndices, images} = this.props;
                const {slidesData, width} = this.state;
                const newIndex = util.getIndex(index, images.length, next);
                x = this.getX({slidesData, width, index: newIndex, renderedIndices});
            }
            this.setState({
                x,
                xBeforePan: x,
                sliding: true,
                panning: false,
                panAxis: ''
            });
            this.updateOverlayOpacity({
                isNext: next,
                reset
            });
            clearTimeout(this.timeouts.sliding);
            this.timeouts.sliding = setTimeout(() => {
                delete this.timeouts.sliding;
                if (reset) {
                    this.setState({
                        sliding: false
                    });
                } else if (typeof callback === 'function') {
                    callback();
                }
            }, 300);
        }

    }

    render() {
        const {width , height, x, sliding, panning} = this.state;        
        const viewboxStyle = {
            transform: `translateX(${x > 0 ? '-' + x : Math.abs(x)}px)`
        };
        const carouselClasses = util.classnames('Carousel', {
            'Carousel--sliding': sliding,
            'Carousel--panning': panning,
        });
        const viewboxClasses = util.classnames('Carousel__viewbox', {
            'Carousel__viewbox--sliding': sliding,
            'Carousel__viewbox--panning': panning
        });
        const buttonPrevClasses = util.classnames('Carousel__button Carousel__button--prev', {
            'Carousel__button--sliding': sliding
        });
        const buttonNextClasses = util.classnames('Carousel__button Carousel__button--next', {
            'Carousel__button--sliding': sliding
        });

        console.log('------------\nCarousel > render');
        return (
            <div
                className={carouselClasses}
                ref={(ref) => {this.carousel = ref;}}
            >
                <Hammer
                    onPanStart={this.onPanStart}
                    onPan={this.onPan}
                    onPanEnd={this.onPanEnd}
                    onPanCancel={this.onPanCancel}
                    options={{
                        touchAction: 'pan-y',
                        recognizers: {
                            pan: {threshold: 3}
                        }
                    }}
                >
                    <div style={{width: '100%', height: '100%'}} >
                        <div
                            className={viewboxClasses}
                            style={viewboxStyle}
                            ref={(ref) => {this.viewbox = ref;}}
                        >
                            {this.renderSlides()}
                        </div>
                    </div>
                </Hammer>
                <div className="Carousel__button-wrapper Carousel__button-wrapper--prev">
                    <div className={buttonPrevClasses} onClick={this.onPrev}>
                        <span>{'<'}</span>
                    </div>
                </div>
                <div className="Carousel__button-wrapper Carousel__button-wrapper--next">
                    <div className={buttonNextClasses} onClick={this.onNext} >
                        <span>{'>'}</span>
                    </div>
                </div>
            </div>
        );
    }
}

export default Carousel;
