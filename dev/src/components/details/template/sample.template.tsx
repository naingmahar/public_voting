import * as React from 'react';
import Slider from '../details_componet/Slider'
import SocialShare from '../details_componet/SocialShare'
import DetailsVote from '../details_componet/DetailsVote'
import {TemplateProps,RawObject} from './type.template'
import FsLightbox from 'fslightbox-react';
import CustomLightBox from '../../common/CustomLightBox'
import {TableView} from '../FormFieldTemplate/FormFieldTemplate'
import {FaStepForward,FaStepBackward} from "react-icons/fa";
import {Link,NavLink} from 'react-router-dom'
import { LightBoxType } from '../../common/common.types';
import { arrayDataTypeGenetor } from '../../common/commont.function';
import { LightBox } from '../../common/LightBox';


type PropsData ={
    props:TemplateProps
}

// const LightBox = (props:LightBoxType)=>{
//     return ( 
//         <div>
//             <FsLightbox  
//                     toggler={ props.toggler } 
//                     sourceIndex={props.sourceIndex} 
//                     sources={ props.sources} 
//                     types={ props.sourcesType } 
//             /> 
//         </div> 
//     ); 
// }


const convertRawToLightBoxArray = (rawArray:RawObject[]) =>{
    return Array.from(rawArray,row=>row.video_image_field_original)
}

const convertDetailsFieldsObjToUiArray = (rawObj:object) =>{
    let rawArray = Object.values(rawObj)
    return Array.from(rawArray,(columns,index) => <p key={index}>{columns}</p>)
}

const SimpleTemplate = (parmas:PropsData) =>{
    const {props} = parmas
    const [toggler, setToggler] = React.useState(false);
    const [ShowImage, setShowImage] = React.useState(false);
    const [indexImageNumber, setIndexImageNumber ] = React.useState(0)

    // const datailFields =  convertDetailsFieldsObjToUiArray(props.form_fields)
    const suburl = props.staticUrl != "" ?`${props.staticUrl}/${props.subUrl}`:props.subUrl

    // const source:Array<string> = convertRawToLightBoxArray(props.data_array)
    // const sourceType:Array<string> = arrayDataTypeGenetor(source)

    console.log(props.votingTypeDetail)
    const openVideoImageDialog = (currentImageIndex) =>{ 
                                        setShowImage(true) 
                                        setToggler(!toggler)
                                        setIndexImageNumber(currentImageIndex)
                                    }
    const stepForwardButton  = <Link to={`/${suburl}/submissions/${props.next}`} className="float-1"><FaStepForward /></Link>
    const stepBackwardButton = <Link to={`/${suburl}/submissions/${props.prev}`} className="float-2"><FaStepBackward /></Link>
    
    return (
        <div className="container">
            {/* <LightBox   toggler={ toggler } sourceIndex={indexImageNumber} sources={ source } sourcesType={sourceType} />  */}
            <LightBox rawSource={props.data_array} toggler={toggler} />
            <div className="row">
                <div className="col s12 xl5">
                    <Slider openVideoImageDialog={openVideoImageDialog}  data_array={props.data_array} />
                </div>
                <div className="col s12 xl3 offset-xl4">
                    <div className="row">   
                        <div className="col s12 center">
                            <DetailsVote 
                                count={props.total_vote}
                                countDisible={props.disibleVotingCount} 
                                mark={props.mark} 
                                submission_id={props.submission_id} 
                                type={props.type} 
                                votingTypeDetail={props.votingTypeDetail}/>
                        </div>
                        <div className="col s12">
                            <SocialShare allowLoginType={props.allowLoginType} title={props.title}/>
                        </div>
                    </div>
                </div>
                <div className="col s12">
                    <div>
                        {/* <p>{props.title}</p>
                        <p>{props.category}</p> */}
                        <TableView  formField={{...{Title:props.title,Category:props.category},...props.form_fields}} />
                        {/* {datailFields} */}
                    </div>
                </div>
            </div>
            <div>
                {props.next != null || "" ? stepForwardButton : <span />}
            </div>
            <div>
                {props.prev != null || "" ? stepBackwardButton : <span />}
            </div>
        </div>
    )
}

export default SimpleTemplate