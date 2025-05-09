import axios from 'axios';
const API_URL = 'https://www.mockachino.com/a0c8bbde-7d0d-4a/snacksItems';
export const fetchSnacks = async () => {
    const response = await axios.get(API_URL);
    return response.data.snacks || [];
};
