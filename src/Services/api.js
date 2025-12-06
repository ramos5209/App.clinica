import axios from "axios";

const api = axios.create({
  baseURL: "http://10.110.12.48:8080",
});

export default api;
