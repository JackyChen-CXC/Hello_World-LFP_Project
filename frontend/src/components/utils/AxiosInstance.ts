import axios from "axios";
import { AXIOS_ENDPOINTS } from "../constants/constants";

const AxiosInstance = axios.create({
	baseURL: AXIOS_ENDPOINTS.DOMAIN,
	// baseURL: AXIOS_ENDPOINTS.LOCAL,
	withCredentials: true
});

export default AxiosInstance;