import { contentType } from "./common.types"
import { FaPlayCircle } from "react-icons/fa"
export const noPreviewImage = "https://s3.ap-southeast-1.amazonaws.com/public.judgify.me/Resources/nopreview.png"
export const noPreviewImageThumbnails ="https://s3.ap-southeast-1.amazonaws.com/public.judgify.me/Resources/nopreview_thumbnail.png"
import * as React from 'react';
import {Link,NavLink} from 'react-router-dom'


export const typeCheck = (image:string|String):contentType =>{
    const imageRegex = /\.(jpeg|JPEG|jpg|JPG|gif|png|PNG|GIF)$/
    const videoRegex = /\.(mp4|MP4)$/
    if(image.match(imageRegex)) return contentType.Image
    if(image.match(videoRegex)) return contentType.Video
  }

export const arrayDataTypeGenetor = (data:Array<string>) =>{
    let response = []
    data.forEach(content=>response.push(typeCheck(content)))
    return response
}

export const thumbnailsImageExists = (src):Promise<boolean> =>{
    return new Promise((resolve,reject)=>{
        var img = new Image();
        img.onload = () => resolve(true)
        img.onerror = () => reject(false)
        img.src = src
    })

}



export const videoTemplate = ({showModel,routePass,route,index,tempImage,callback}) =>{
    const videoModel =  <div key={index} style={{height:"50%"}}>
                            <img src={tempImage} className="responsive-img center-img"/>
                            <a href="#" onClick={callback} >
                                <div className="float-video" style={{bottom:"65%"}}><FaPlayCircle size={50} /></div>
                            </a>
                        </div>
                        
    const videoLink =  <Link  to={route} key={index}> <img src={tempImage} /> </Link>

    if(showModel) return videoModel
    if(routePass) return videoLink
}


export const imageTemplate = ({showModel,routePass,route,index,tempImage,callback}) =>{
    const imageModel =  <a href="#" onClick={callback} key={index}>
                            <img src={tempImage} className="responsive-img"/>
                        </a>
                        
    const imageLink =  <Link  to={route} key={index}> <img src={tempImage} /> </Link>

    if(showModel) return imageModel
    if(routePass) return imageLink
}

export const ImageHandler = async (video_image,callback,suburl,submission_id) =>{
    let contents = []
    let cache 
    
    for (let index = 0; index < video_image.length; index++) {
        const element = video_image[index];
        const route = `${suburl}/submissions/${submission_id}`
        const contentType = typeCheck(element.video_image_field_original)
        let image = ""

        try {
            await thumbnailsImageExists(element.video_image_field_thumbnail)
            image = element.video_image_field_thumbnail
        } catch (error) { 
            image = element.video_image_field_original
            if(contentType == "video") image = noPreviewImageThumbnails
        } 

        let setting = {
            index:contents.length,
            showModel:true,
            tempImage:image,
            route,
            callback,
            routePass:false
        }
        if(!element.is_no_image){
            if(contentType=="video") contents.push(videoTemplate(setting))
            if(contentType=="image") contents.push(imageTemplate(setting))
        }

        if(!cache){
            if(contentType=="video") cache = videoTemplate(setting)
            if(contentType=="image") cache = imageTemplate(setting) 
        }
    }

    if(!contents.length) contents.push(cache)
    return contents
}