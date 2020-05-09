import sigmoidSquishification from './sigmoidSquishification';

function derivOfSigmoid (value){
    return sigmoidSquishification(value) * (1-sigmoidSquishification(value));
}

export default derivOfSigmoid