import axios from './axios'
import { Categories } from '../Model/categories.model'


const get = async (url,pathParams ="") =>{
    try {
        url = url + pathParams
        return await axios.get(url)
    } catch (error) {
        return Promise.reject(error)
    }
}

const post = async (url,params = {},pathParams ="") =>{
    try {
        url = url + pathParams
        return await axios.post(url,params)
    } catch (error) {
        return Promise.reject(error)
    }
}
export default {
    getVotingRoundHeader: (pathParams) => get("/voting-round/get-data/",pathParams),
    initial: (pathParams) => get("/get-data/",pathParams),
    getSubmissionList: (data,pathParams) => post("voting-round/get-submission-list/",data,pathParams),
    getAnnoymousVoter: () => post("voting-round/anonymous-voter"),
    saveVoter: (data) => post("voting-round/save-voter",data),
    getLinkedin: (data) => post("voting/linkedin",data),
    saveVotingResult: ({voting_round_id, voter_id, submission_id,mark}) => post("voting-round/save-voting-result",{voting_round_id, voter_id, submission_id,mark}),
    getDeatils: ({pathParams,params}) => post("voting-round/get-submission-detail-information",params,pathParams),
    getAbout: (pathParams) => get("/voting-round/get-about-page/",pathParams),
    getCategory: async (pathParams) => {
        const response = await get("/voting-round/get-category-list/",pathParams)
        return Categories(response.data)
    },
} 


