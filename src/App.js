import React, {Component} from 'react';
import Carousel from './components/Carousel';
import util from './utils/CarouselUtil';
import './App.css';

const counts = {
    arch: -1,
    tech: -1,
    animals: -1,
    nature: -1
}

const getImageURL = (height, width, type) => {
    counts[type] = counts[type] + 1;
    return `http://placeimg.com/${width}/${height}/${type}/${counts[type]}`;
}

const getImageData = (index) => {
    if (index % 4 === 0) {
        return {
            height: 270,
            width: 480,
            url: getImageURL(270, 480, 'animals'),
            backgroundColor: '#f1e4b6'
        };
    }
    if (index % 3 === 0) {
        return {
            height: 480,
            width: 270,
            url: getImageURL(480, 270, 'arch'),
            backgroundColor: '#ea9773'
        };
    } else if (index % 2 === 0) {
        return {
            height: 400,
            width: 300,
            url: getImageURL(400, 300, 'tech'),
            backgroundColor: '#c54133'
        };
    }
    return {
        height: 300,
        width: 400,
        url: getImageURL(300, 400, 'nature'),
        backgroundColor: '#21959e'
    }
}

let images = [];
for (let i = 0; i < 20; i++) {
    images.push(getImageData(i));
}

class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            index: 0
        }
    }

    onPrev = () => {
        this.setState({
            index: util.getIndex(this.state.index, images.length, false)
        });
    }

    onNext = () => {
        this.setState({
            index: util.getIndex(this.state.index, images.length, true)
        });
    }

    render() {
        const {index} = this.state;
        const renderedIndicesCount = 5;
        return (
            <div className="App">
                <div className="CarouselContainer">
                    <Carousel
                        index={index}
                        renderedIndices={util.getRenderedIndices(index, images.length, renderedIndicesCount)}
                        images={images}
                        slideSize={'height'}
                        onPrev={this.onPrev}
                        onNext={this.onNext}
                    />
                </div>
            </div>
        );
    }
}

export default App;
