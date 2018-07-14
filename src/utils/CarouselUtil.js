const SETTINGS = {

};

const utils = {
    getRenderedIndices(index, length, count) {
        const renderedIndices = [];
        const sideLength = Math.floor(count / 2);
        renderedIndices[sideLength] = index;
        let tempIndex = index;
        for (let i = 0; i < sideLength; i++) {
            tempIndex = utils.getIndex(tempIndex, length, false);
            renderedIndices[sideLength - 1 - i] = tempIndex;
        }
        tempIndex = index;
        for (let i = 0; i < sideLength; i++) {
            tempIndex = utils.getIndex(tempIndex, length, true);
            renderedIndices[sideLength + i + 1] = tempIndex;
        }
        return renderedIndices;
    },

    getIndex(index, length, next) {
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
    },
    
    getPositionFlags({shouldRender, i, index, prevIndex, nextIndex}) {
        if (shouldRender) {
            const isCurrent = i === index;
            const isPrev = i === prevIndex;
            const isNext = i === nextIndex;
            const label = `${isCurrent ? 'current' : ''}${isPrev ? 'prev' : ''}${isNext ? 'next' : ''}`;
            return {isCurrent, isPrev, isNext, label};
        }
    },

    getSlideSize({carouselHeight = 0, carouselWidth = 0, imageHeight = 0, imageWidth = 0, slideSize}) {
        const carouselAR = carouselWidth / carouselHeight;
        const imageAR = imageWidth / imageHeight;
        const data = {
            height: Math.round(carouselHeight),
            width: Math.round(carouselWidth),
            imageHeight,
            imageWidth
        };

        if (slideSize === 'height') {
            data.width = Math.round(imageAR * carouselHeight);
        }

        return data;
    },

    getSlideMargin(carouselWidth, slideWidth) {
        return (carouselWidth - slideWidth) / 2;
    },

    getPanPercent({carouselWidth, slidesData, index, length, deltaX}) {
        const isNext = deltaX < 0; 
        const nextIndex = utils.getIndex(index, length, isNext);
        const curSlideWidth = slidesData[index].width;
        const curSlideMargin = utils.getSlideMargin(carouselWidth, curSlideWidth);
        const nextSlideWidth = slidesData[nextIndex].width;
        const nextSlideMargin = utils.getSlideMargin(carouselWidth, nextSlideWidth);
        const totalDistance = nextSlideWidth + nextSlideMargin - curSlideMargin;
        const pct = Math.abs(deltaX) / totalDistance;
        return pct; 
    },

    classnames(names = '', namesObj) {
        let classes = names;
        for (let key in namesObj) {
            if (namesObj[key]) {
                classes = classes.concat(` ${key}`);
            }
        }
        return classes;
    },

    normalize(value, min = 0, max = 1) {
        return Math.max(Math.min(value, max), min);
    }
}

export default utils;
export {
    SETTINGS,
    utils
};