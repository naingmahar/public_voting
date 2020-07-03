import { combineReducers } from 'redux'
import * as Action from '../action/index'
import {AuthModel,AuthType,AnonymousType} from '../components/common/Auth.Model'
import { DialogParamType, initialStateType } from '../components/common/common.types'

const initState:initialStateType ={
    suburl:"",
    staticUrl:"",
    headerData:{}, 
    backupHeaderData:{}, 
    cache:{},
    currentPage:"",
    isCalling:false,
    AnonymousData:{},
    Authorize:false,
    voter_id:"",
    loginDialog:false,
    defaultApiUrl:"",
    event_id:"",
    voting_round_id:"",
    alertPayload:{},
    confirmPayload:{},
    logoutBox:false
}

const rootReducer = (state = initState,action) => {
    if(action.type == Action.type.Error) state = ({...state,...{Error:action.data}})
    
    if(action.type == Action.type.alertBox) state = ({...state,...{alertPayload:action.data}})
    if(action.type == Action.type.LogoutBox) state = ({...state,...{logoutBox:action.data}})
    if(action.type == Action.type.currentPage) state = ({...state,...{currentPage:action.data}})
    if(action.type == Action.type.Cache) state = ({...state,...{cache:action.data}})
    if(action.type == Action.type.addStaticUrl) state = staticUrl(state,action)
    if(action.type == Action.type.addSuburl) state = suburl(state,action)

    if(action.type == Action.type.initialCall) state = initialCall(state,action)
    if(action.type == Action.type.initialCall) state = defaultApiUrl(state,action)
    if(action.type == Action.type.initialCall) state = autoLogin(state)
    if(action.type == Action.type.isCalling) state = isCalling(state,action)
    if(action.type == Action.type.AnonymousData) state = AnonymousData(state,action)
    if(action.type == Action.type.addVotingRoundHeader) state = votingRoundHeader(state,action)
    if(action.type == Action.type.LoginDialog) state = ({...state,...{loginDialog:action.data}}) 
    if(action.type == Action.type.logout) state =  logout(state)
    if(action.type == Action.type.HeaderData) state = updateHeaderAndBackupOriginalHeader(state,action)
    if(action.type == Action.type.RestoreHeaderData) state = ({...state,...{headerData:state.backupHeaderData}})
    console.log("Redux",state);
   
    return state
}

const common = (state ,action) => ({...state,...action.data})
const initialCall = (state ,action) => ({...state,...action.data,...{Error:{status:0}}})
const defaultApiUrl = (state,action) => ({...state,...{defaultApiUrl:`${state.event_id}/${state.voting_round_id}`}}) 
const isCalling = (state ,action) => ({...state,...{isCalling:true}})
const staticUrl = (state ,action) => ({...state,...{staticUrl:action.data}})
const suburl = (state ,action) => ({...state,...{suburl:action.data}})
const votingRoundHeader = (state ,action) =>({...state,...{headerData:action.data}})
const AnonymousData = (state ,action) => {
    let tempState = {...state,...action.data}
    login(tempState)
    return tempState
}
const updateHeaderAndBackupOriginalHeader = (state:initialStateType,action) =>{
    return ({...state,...{backupHeaderData:state.headerData,headerData:action.data}})
} 

const  login = (state:initialStateType) => {
    let payload:AuthType = {
        AnonymousData:state.AnonymousData,
        Authorize:state.Authorize,
        event_id:state.event_id,
        suburl:state.suburl,
        voter_id:state.voter_id,
        voting_round_id:state.voting_round_id
    }

    let authModel = new AuthModel()
    authModel.setAuth(payload)
}

const logout = (state) => {
    let authModel = new AuthModel()
    authModel.clearAuth()
    return {...state,...{AnonymousData:{},Authorize:false,voter_id:""}}
}

const autoLogin = (state:initialStateType) => {
    let authModel = new AuthModel()
    let payload:AuthType 
    
    try {
        payload = authModel.getAuth()
        if(!payload && state.event_id != payload.event_id && state.voting_round_id != payload.voting_round_id ) return state
    } catch (error) {
        return state
    }
    

    const tempState = {
        AnonymousData:payload.AnonymousData,
        voter_id:payload.voter_id,
        Authorize:payload.Authorize
    }
    return {...state,...tempState}
}

export default rootReducer