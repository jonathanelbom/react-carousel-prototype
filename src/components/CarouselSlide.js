import React, {Component} from 'react';
import util from '../utils/CarouselUtil';
import './CarouselSlide.css';

class CarouselSlide extends Component {
    constructor(props) {
        super(props);
        
        console.log('\tCarouselSlide >', this.props.index, '> constructor');
    }

    shouldComponentUpdate(nextProps) {
        const {index, shouldRender, panning, sliding} = nextProps;
        const shouldUpdate =  !panning && !sliding && (shouldRender || shouldRender !== this.props.shouldRender);
        return shouldUpdate;
    }
    
    render() {
        const {
            index,
            slideStyle,
            shouldRender,
            url,
            setSlideRef,
            isCurrent
        } = this.props;
        
        console.log('\tCarouselSlide >', index, '> render');

        const slideClasses = util.classnames('CarouselSlide', {
            'CarouselSlide--current': isCurrent
        });
        const overlayClasses = util.classnames('CarouselSlide__overlay', {
            'CarouselSlide__overlay--current': isCurrent
        });

        return (
            <div
                className={slideClasses}
                style={slideStyle}
                ref={setSlideRef}
            >
                {shouldRender && // eslint-disable-line
                    <img className="CarouselSlide__image"
                        src={url}
                    />
                }
                <div className="CarouselSlide__details">
                    <span>{index}</span>
                </div>
                <div className={overlayClasses} />
            </div>
        );
    }
}

export default CarouselSlide;
