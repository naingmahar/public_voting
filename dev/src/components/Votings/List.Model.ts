export type SubmissionObjectType = {
    number_of_shortlisted_submissions:Number,
    submissions:Array<SubmissionsType>,
    total_shortlisted_submission:Number,
    msg:string,
    success:boolean   
}

export type SubmissionsType ={
        category: string
        eventcategory_id: string
        imgtype: string
        mark: string
        submission_id: string
        text_field: string
        title: string
        total_mark: string
        type: string
        video_image: Array<VideoImageType>
}

export type VideoImageType = {
    video_image_field_original:string,
    video_image_field_thumbnail:string

}