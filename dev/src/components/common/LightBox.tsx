import * as React from 'react';
import { LightBoxType, RawObject } from "./common.types";
import FsLightbox from 'fslightbox-react';
import { arrayDataTypeGenetor } from './commont.function';

export const LightBox = (props:LightBoxType)=>{
    
    const sources = convertRawToLightBoxArray(props.rawSource)
    const sourcesType = arrayDataTypeGenetor(sources)
    return ( 
        <div>
            <FsLightbox  
                    toggler={ props.toggler } 
                    sourceIndex={props.sourceIndex} 
                    sources={ sources} 
                    types={ sourcesType } 
            /> 
        </div> 
    ); 
}


const convertRawToLightBoxArray = (rawArray:RawObject[]) =>{
    const source = []
    let cache 
    rawArray.map(row=>{
        if(!row.is_no_image) source.push(row.video_image_field_original)
        if(!cache)  cache =row.video_image_field_original
    })

    if (!source.length) source.push(cache)
    return source
}