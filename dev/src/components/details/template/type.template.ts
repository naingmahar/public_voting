export type RawObject = {
    video_image_field_original:string,
    video_image_field_thumbnail:string
}

  
export type TemplateProps = {
    allowLoginType:string,
    count:Number,
    type:string,
    mark:string,
    submission_id:string
    data_array:RawObject[],
    title:string,
    category:string,
    form_fields:any,
    staticUrl:string,
    subUrl:string,
    prev: Number|String,
    next:Number|String,
    total_vote:Number|String,
    disibleVotingCount?:number
    votingTypeDetail?:{},
}