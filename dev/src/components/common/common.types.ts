import { AnonymousType } from "./Auth.Model"

export type DialogParamType = {
    Message:String
    open?:boolean
    close?:any
    icon?:any
    mutpileClose?:{close:any,confirm:any}
    buttonText?:Array<string>
}

export type SocialShareType ={
    count?:String|Number,
    type:string,
    mark:string,
    submission_id:string,
    action?:Function,
    countDisible?:number,
    votingTypeDetail?:{}
}

export type initialStateType = {
    AnonymousData: AnonymousType|any
    Authorize: Boolean
    cache: any
    defaultApiUrl: String
    event_id: String
    headerData:any
    isCalling: Boolean
    loginDialog: Boolean
    staticUrl: String 
    suburl: String
    voter_id: String
    voting_round_id: String,
    backupHeaderData:any,
    currentPage:String,
    alertPayload:DialogParamType|any,
    confirmPayload:DialogParamType|any,
    logoutBox:Boolean,
    Error?:errorType
}

export type errorType = {
    status:number,
    message?:string
}

export type getSubmissionType = {
    event_id?:any
    voting_round_id ?: any
    deafultApiUrl ?: any
}


export type RawObject = {
    video_image_field_original:string,
    video_image_field_thumbnail:string,
    is_no_image?:boolean
  }
  
export type SliderProps = {
    data_array:RawObject[]
    openVideoImageDialog:Function
  }
  
export type imageVideoTemplateParamType = {
    key:string|number,
    image:string,
    action:Function
  }
  
export enum contentType {
    Image = "image",
    Video = "video"
}


export type LightBoxType = {
  toggler:boolean,
  sourceIndex?:number,
  sources?:Array<string>
  sourcesType?:Array<string>
  rawSource?:RawObject[]
}

export type filterCallBackType = {
  categoryOpen ?: boolean,
  sortOpen ?: boolean,
  sort ?: string,
  category ?: string,
  search ?: string | number | string[],
  uuid?:string,
  filterToogle?:number
}