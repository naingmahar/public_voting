import axios from 'axios'
const config = require('../../config').config()

const baseURL = config.URL

const axios_insant = axios.create({
    baseURL,
    timeout: 50000,
    headers: {
        //'Accept': 'application/json',
        // 'Content-Type': 'application/x-www-form-urlencoded'
      },
});

export default axios_insant
