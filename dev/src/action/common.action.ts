import API from '../api/index'
import {get,type,getError} from './index'
import { DialogParamType, getSubmissionType } from '../components/common/common.types'

const errorController = (error) =>{
    console.error("Response error",error)
    const payload:DialogParamType = {Message:error.message||"Please retry again",open:true}
    return get(type.alertBox,payload)
}

export const getVoteIdAndEventId = (VotingName) =>{
    return async (dispatch) => {
        try {
            const response =  await API.initial(VotingName)
            return dispatch(get(type.addVIdAndEId,response.data)) 
        } catch (error) {
            const errorRes = errorController(error)
            return dispatch(errorRes)
        }
    };
}

export const getVotingRoundHeader = ({vId,eId}) => {
    return async (dispatch) => {
        try {
            const pathParams = `${eId}/${vId}`
            const response =  await API.getVotingRoundHeader(pathParams)
            return dispatch(get(type.addVotingRoundHeader,response.data)) 
        } catch (error) {
            const errorRes = errorController(error)
            return dispatch(errorRes)
        }
    };
};

export const initial = (VotingName) => {
    return async (dispatch) => {
        try {
            const response1 =  await API.initial(VotingName)
            const {voting_round_id,event_id} = response1.data
            if(!voting_round_id || !event_id) return dispatch(getError({status:404,message:"Page Not Found"}))
            const pathParams = `${event_id}/${voting_round_id}`
            const response2 =  await API.getVotingRoundHeader(pathParams)
            if(!response2.data || typeof(response2.data) != "object"  ) return dispatch(getError({status:500,message:"Voting Round setup is not Finished"}))
            const payload= {...response1.data,...{headerData:response2.data}}
            return dispatch(get(type.initialCall,payload)) 
        } catch (error) {
            return dispatch(getError({status:500,message:error.message}))
        }
    };
};

export const getSubmissionList = ({event_id,voting_round_id,deafultApiUrl}:getSubmissionType,{start,limit}) => {
    return async (dispatch) => {
        try {
            let pathParams = deafultApiUrl?deafultApiUrl:`${event_id}/${voting_round_id}` 
            const response =  await API.getSubmissionList({start,limit},pathParams)
            console.log("Sub List",response)
            return dispatch(get(type.addSubmissionList,{SubmissionList:response.data})) 
        } catch (error) {
            const errorRes = errorController(error)
            return dispatch(errorRes)
        }
    };
};

export const getAnonymousData = () => {
    return async (dispatch) => {
        try {
            const response =  await API.getAnnoymousVoter()
            console.log("response",response.data)
            const User = await API.saveVoter(response.data)
            console.log("Login Status",User.data)
            return dispatch(get(type.AnonymousData,{AnonymousData:response.data,Authorize:true,voter_id:User.data})) 
        } catch (error) {
            const errorRes = errorController(error)
            return dispatch(errorRes)
        }
    };
};
export const getLinkedin = ({id, token}) => {
    return async (dispatch) => {
        try {           
            
            const response =  await API.getLinkedin({id, token})     
            return dispatch(get(type.linkedinList,{linkedinList:response.data})) 
            
        } catch (error) {
            const errorRes = errorController(error)
            return dispatch(errorRes)
        }
    };
};

export const SaveVoter = (payload) => {
    return async (dispatch) => {
        try {
            const User = await API.saveVoter(payload)
            console.log("Login Status",User.data)
            return dispatch(get(type.AnonymousData,{AnonymousData:payload,Authorize:true,voter_id:User.data})) 
        } catch (error) {
            const errorRes = errorController(error)
            return dispatch(errorRes)
        }
    };
};

export const alertBoxAction = (payload:DialogParamType) => {
    return async (dispatch) => {
        return dispatch(get(type.alertBox,payload))
    };
};

