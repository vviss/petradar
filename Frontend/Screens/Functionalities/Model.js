import * as tf from '@tensorflow/tfjs';
import * as mobilenet from '@tensorflow-models/mobilenet';
import { fetch } from '@tensorflow/tfjs-react-native';
import * as jpeg from 'jpeg-js';

export default function Model(imageUrl) {

  const url = imageUrl;

  async function predict(url) {
    console.log('Loading TensorFlow:');
    await tf.ready();

    console.log('TF ready, loading Mobile Net');
    const model = await mobilenet.load();

    console.log('Mobile Net ready, fetching image');
    const response = await fetch(url, {}, {isBinary: true});

    console.log('Getting image buffer');
    const imageData = await response.arrayBuffer();

    console.log('Getting image tensor');
    const imageTensor = imageToTensor(imageData);

    console.log('Getting classification result');
    const prediction = await model.classify(imageTensor);

    console.log('This is a photo of a:', prediction);
    return prediction;
  }

  function imageToTensor(rawData) {
    const { width, height, data } = jpeg.decode(rawData, true);
    const buffer = new Uint8Array(width * height * 3);
    let offset = 0;

    for(let i=0; i<buffer.length; i+=3) {
      buffer[i] = data[offset] //Red
      buffer[i+1] = data[offset+1] //Green
      buffer[i+2] = data[offset+2] //Blue
      offset += 4 //Skip Alpha  
    }

    return tf.tensor3d(buffer, [height, width, 3]);
  }

  return predict(url);
}
