import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
const API_URL = `${API_BASE_URL}/api/dashboard/stats`;

export const getDashboardStats =
async () => {

  const response =
    await axios.get(API_URL);

  return response.data;

};