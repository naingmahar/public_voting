import * as React from 'react';
import {Carousel} from 'react-responsive-carousel'
import VotingTypeUi from '../common/VotingType'
import {Link,NavLink} from 'react-router-dom'
import {connect} from 'react-redux'
import {thumbnailsImageExists,typeCheck, noPreviewImageThumbnails, ImageHandler} from '../common/commont.function'
import {VotingType} from '../../resource/app.setting'
import {LightBox} from '../common/LightBox'
import {FaPlayCircle} from "react-icons/fa";
import { filterCallBackType } from '../common/common.types';
const {VoteManager} = VotingTypeUi

class Card extends React.Component<any,any> {

    state={
        images:[],
        toggler:false
    }

    lightboxControl = (e) =>{
        this.setState({toggler:!this.state.toggler})
        e.preventDefault()
    }

    _handleCategory = (e) =>{
        const filter:filterCallBackType= {
            search:"",
            sort:"",
            uuid:"",
            category:this.props.data.category
        }
        this.props.filterCallBack(filter)
        e.preventDefault()
    } 


    componentDidMount(){
       ImageHandler(this.props.data.video_image,this.lightboxControl,this.props.suburl,this.props.data.submission_id)
        .then(images=>this.setState({images}))
        .catch(error => console.error(error))
    }

    textValidator = (text) =>{
        const length = String(text).length
        if(length <= 30)return text

        const newText = String(text).substring(0,25).concat("...")
        return newText
    }

    render(){
        const {data,type} = this.props
        const {category,title,submission_id,text_field,video_image,mark} = data

        const suburl = this.props.suburl
        let showImageCount = false
        if(this.state.images && this.state.images.length > 1){
            showImageCount = true
        }

        return(
                <div className="col xl3 s12 m6">
                    <LightBox rawSource={this.props.data.video_image} toggler={this.state.toggler} />
                    <div className="row">
                        <div className="col s12">
                            <div className="card">
                                <div className="card-image">
                                    <Carousel showArrows={true} showIndicators={false} showStatus={showImageCount} >
                                        {this.state.images}
                                    </Carousel>
                                </div>   
                                <div className="card-content">
                                    <Link to={`${suburl}/submissions/${submission_id}`}><h4>{this.textValidator(title)}</h4></Link>

                                    <a href="#" onClick={(e)=>this._handleCategory(e)}><h5>{this.textValidator(category)}</h5></a>
                                    <h6>{this.textValidator(text_field)}</h6>    
                                </div>
                                <div className="card-action center-align">
                                    {/* {Vote(type,mark,submission_id)} */}
                                    <VoteManager type={type} mark={mark} submission_id={submission_id} votingTypeDetail={this.props.votingTypeDetail} />
                                </div> 
                            </div>
                        </div>
                    </div>
                </div>
            )
    }
}

const mapStateToProps = (state) =>{
    return {
      suburl:state.suburl,
      staticUrl:state.staticUrl
    }
}
  
  
export default  connect(mapStateToProps)(Card)
