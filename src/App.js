import React, {Component} from 'react';
import Carousel from './components/Carousel';
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
            index: this.getIndex(this.state.index, false)
        }, () => {
            // console.log('onPrev, this.state.index:', this.state.index);
        });
    }

    onNext = () => {
        this.setState({
            index: this.getIndex(this.state.index, true)
        }, () => {
            // console.log('onNext, this.state.index:', this.state.index);
        });
    }

    getRenderedIndices(index) {
        const count = 5;
        const renderedIndices = [];
        const sideLength = Math.floor(count / 2);
        renderedIndices[sideLength] = index;
        let tempIndex = index;
        for (let i = 0; i < sideLength; i++) {
            tempIndex = this.getIndex(tempIndex, false);
            renderedIndices[sideLength - 1 - i] = tempIndex;
        }
        tempIndex = index;
        for (let i = 0; i < sideLength; i++) {
            tempIndex = this.getIndex(tempIndex, true);
            renderedIndices[sideLength + i + 1] = tempIndex;
        }
        return renderedIndices;
    }

    getIndex(index, next) {
        const length = images.length;
        if (next) {
            return index + 1 <= length - 1
                ? index + 1
                : 0;
        } else {
            return index - 1 >= 0
                ? index - 1
                : length - 1;
        }
        return index;
    }

    render() {
        const {index} = this.state;
        return (
            <div className="App">
                <Carousel
                    index={index}
                    renderedIndices={this.getRenderedIndices(index)}
                    images={images}
                    slideSize={'height'}
                    onPrev={this.onPrev}
                    onNext={this.onNext}
                    getIndex={this.getIndex}
                />
            </div>
        );
    }
}

export default App;
