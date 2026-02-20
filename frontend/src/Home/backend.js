import axios from 'axios';

export const trainModel = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await axios.post('http://localhost:5000/train', formData);
    return response.data;

    // const response = await axios.post('http://localhost:5000/train', { file });
    // return response.data;
};

// export const generateModel = async (file) => {
//     const response = await axios.post('http://localhost:5000/generate', { file });
//     return response.data;
// };

// export const getModel = async () => {
//     const response = await axios.get('http://localhost:5000/model');
//     return response.data;
// };