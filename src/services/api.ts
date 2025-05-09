import axios from 'axios';
import { SnackItem, SnacksResponse } from '../types/snacks';

const API_URL = 'https://www.mockachino.com/a0c8bbde-7d0d-4a/snacksItems';

export const fetchSnacks = async (): Promise<SnackItem[]> => {
  const response = await axios.get<SnacksResponse>(API_URL);
  return response.data.snacks || [];
};