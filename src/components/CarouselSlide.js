import React, {Component} from 'react';
import './CarouselSlide.css';

class CarouselSlide extends Component {
    // constructor(props) {
    //     super(props);

    //     console.log('CarouselSlide >', this.props.index, '> constructor');
    // }

    shouldComponentUpdate() {
        return true;
    }

    render() {
        const {index, slideStyle, shouldRender, url} = this.props;
        
        // console.log('\tCarouselSlide >', index, '> render, url:', url);

        return (
            <div
                className="CarouselSlide"
                style={slideStyle}
            >
                {shouldRender && // eslint-disable-line
                    <img className="CarouselSlide__image"
                        src={url}
                    />
                }
                <div className="CarouselSlide__details">
                    <span>{index}</span>
                </div>
            </div>
        );
    }
}

export default CarouselSlide;
