import { errorType } from "../components/common/common.types"

const type = {
    addStaticUrl: "staticUrl",
    addSuburl:"suburl",
    addVIdAndEId:"vIdAndEId",
    addeventId:"eventId",
    addvotingRoungId:"votingRoungId",
    addVotingRoundHeader:"votingRoundHeader",
    initialCall:"initialCall",
    addSubmissionList:"SubmissionList",
    newSubmissionList:"NewSubmissionList",
    isCalling:"IsCalling",
    BlockListCalling:"BlockListCalling",
    AnonymousData:"AnonymousData",
    login:"LOGIN",
    logout:"LOGOUT",
    Vote:"Vote",
    LoginDialog:"LoginDialog",
    Cache:"cache",
    HeaderData:"headerData",
    CacheHeaderData:"CacheHeaderData",
    RestoreHeaderData:"restoreHeaderData",
    currentPage:"CurrentPage",
    alertBox:"AlertBox",
    LogoutBox:"LogoutBox",
    Error:"Error",
    ErrorMessage:"ErrorMessage",
    linkedinList:"LinkedinList",
}
const get = (actionType,data) =>{
    return {type:actionType,data}
}

const getError = (payload:errorType) =>{
    const {message,status} = payload
    return {type:type.Error,data:{message,status}}
}

export {get,getError,type}
 
