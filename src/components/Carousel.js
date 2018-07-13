import React, {Component} from 'react';
import Hammer from 'rc-hammerjs';
import CarouselSlide from './CarouselSlide';
import './Carousel.css';

const transitionDuration = 250;

class Carousel extends Component {
    constructor(props) {
        super(props);

        const {width, height} = this.getSize();
        const {index, renderedIndices} = this.props;
        const slidesData = this.getSlidesData(height, width);
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
        // console.log('this.props:', this.props);
    }

    componentWillReceiveProps(nextProps) {
        const {index} = this.props;
        const {slidesData, width, x} = this.state;
        // console.log('componentWillReceiveProps:', nextProps);
        if (nextProps.index !== index) {
            const x = this.getX({slidesData, width, index: nextProps.index, renderedIndices: nextProps.renderedIndices});
            this.setState({
                x,
                xBeforePan: x,
                sliding: false
            })
        }
    }

    componentDidMount() {
        const {height, width} = this.getSize();
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
    }

    getX({slidesData, width, index, renderedIndices}) {
        const indexOfIndex = renderedIndices.indexOf(index);
        const posIndices = renderedIndices.slice(0, indexOfIndex);
        const dist = posIndices.reduce((accum, curVal) => {
            const d = slidesData[curVal].slideWidth;
            // console.log('slidesData[', curVal, '].slideWidth:', slidesData[curVal].slideWidth);
            return d + accum;
        }, 0);
        const margin = (width - slidesData[index].slideWidth) / 2;        
        // console.log('margin:', margin, ', posIndices:', posIndices, ', indexindexOfIndex:', indexOfIndex, ', dist:', dist, ', slidesData:', slidesData);
        return dist - margin;;
    }

    getSlidesData(carouselHeight = 0, carouselWidth = 0) {
        const {slideSize, images} = this.props;
        return images.map((image, i) => {
            const {width, height} = image;
            const imageAR = width / height;
            const data = {
                slideHeight: Math.round(carouselHeight),
                slideWidth: Math.round(slideSize !== 'height' || carouselWidth === 0 ? carouselWidth : imageAR * carouselHeight)
            };
            return data;
        });
    }

    // getSlideSize({carouselHeight, carouselWidth, imageHeight, imageWidth, slideSize}) {
    //     const carouselAR = carouselWidth / carouselHeight;
    //     const imageAR = imageWidth / imageHeight;
    //     if (slideSize === 'height') {
    //         return {
    //             slide
    //         }
    //     } else {

    //     }
    // }

    onResize = () => {
        
    }

    onPrev = () => {
        this.slide(false, this.props.onPrev);
    }

    onNext = () => {
        this.slide(true, this.props.onNext);
    }


    getSize = () => {
        const size = {width: 0, height: 0}
        if (this.carousel) {
            size.width = this.carousel.clientWidth || this.carousel.getBoundingClientRect().width || 0;
            size.height = this.carousel.clientHeight || this.carousel.getBoundingClientRect().height || 0;
        }
        return size;
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
        // console.log('index:', index, ', order:', order, ', indexOfIndex:', indexOfIndex, ', renderedIndices:', renderedIndices);
        return {
            order,
            width: `${slidesData[index].slideWidth}px`,
            height: `${slidesData[index].slideHeight}px`,
            backgroundColor: data.backgroundColor
        };
    }

    renderSlides() {
        const {images, renderedIndices} = this.props;
        const {width, height, slidesData} = this.state;
        return images.map((image, i) => {
            return (
                <CarouselSlide
                    key= {`slide_${i}`} 
                    index={i}
                    height={slidesData[i].slideHeight}
                    width={slidesData[i].slideWidth}
                    carouselHeight={height}
                    carouselWidth={width}
                    slideStyle={this.getSlideStyle(i, image)}
                    shouldRender={renderedIndices.indexOf(i) > -1}
                    url={image.url}
                />
            );
        });
    }

    onPanStart = (e) => {
        const {direction, deltaX, deltaY} = e;
        const {panning, x, sliding} = this.state;
        const horz = [2, 4];
        const xBeforePan = x;
        // console.log('onPanStart, direction:', direction, ', deltaX:', deltaX, ', deltaY:', deltaY);
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
        // console.log('onPan, additionalEvent:', additionalEvent, ', deltaX:', deltaX, ', deltaY:', deltaY);
        if (panAxis === 'horz' && addE.indexOf(additionalEvent) > -1 && Math.abs(deltaY) < 60) {
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
        // console.log('onPanStopped, from:', from, ', deltaX:', deltaX, ', deltaY:', deltaY);
        if (deltaX > threshold) {
            this.onPrev();
        } else if (deltaX < -threshold) {
            this.onNext();
        } else {
            this.slide(null, null, true);
        }
    }

    slide(next, callback, reset) {
        if (this.viewbox) {
            let x = this.state.xBeforePan;
            if (!reset) {
                const {getIndex, index, renderedIndices} = this.props;
                const {slidesData, width} = this.state;
                const newIndex = getIndex(index, next);
                x = this.getX({slidesData, width, index: newIndex, renderedIndices});
            }
            this.setState({
                x,
                xBeforePan: x,
                sliding: true,
                panning: false,
                panAxis: ''
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
        const {width , height, x, sliding} = this.state;
        
        // console.log('\n---------\nCarousel > render, x:', x);

        const viewboxStyle = {
            transform: `translateX(${x > 0 ? '-' + x : Math.abs(x)}px)`
        };
        
        return (
            <div
                className="Carousel"
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
                            className={`Carousel__viewbox ${sliding ? 'Carousel__viewbox--sliding' : ''}`}
                            style={viewboxStyle}
                            ref={(ref) => {this.viewbox = ref;}}
                        >
                            {this.renderSlides()}
                        </div>
                    </div>
                </Hammer>
                <div className="Carousel__button-wrapper Carousel__button-wrapper--prev">
                    <div className={`Carousel__button Carousel__button--prev ${sliding ? 'Carousel__button--sliding' : ''}`} onClick={this.onPrev}>
                    <span>{'<'}</span>
                    </div>
                </div>
                <div className="Carousel__button-wrapper Carousel__button-wrapper--next">
                    <div className={`Carousel__button Carousel__button--next ${sliding ? 'Carousel__button--sliding' : ''}`} onClick={this.onNext} >
                        <span>{'>'}</span>
                    </div>
                </div>
            </div>
        );
    }
}

export default Carousel;
