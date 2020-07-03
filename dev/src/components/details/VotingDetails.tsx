import * as React from 'react';
import API from '../../api'
import {connect} from 'react-redux'
import * as Action from '../../action'
import {SimpleTemplate} from './template/index.template'
import {TemplateProps} from './template/type.template' 
import ListLoader from '../common/ListLoading'
import { PAGE_NAME } from '../../resource/message';
import { alertBoxAction } from '../../action/common.action';
import { RawObject } from '../common/common.types';
import { thumbnailsImageExists, noPreviewImageThumbnails } from '../common/commont.function';

interface DState {
    templateProps:TemplateProps
    template_type:string
    showDeatils:boolean
}

class Deatils extends React.Component<any,DState>{

    UNSAFE_componentWillMount(){
        this.setState({
            showDeatils:false
        })
        this.props.SetCurrentPageName()
    }

    convertDataArrayObjectToArray = (data_array):Array<any> =>{
        const type = typeof(data_array)
        if(type != "object") return data_array
        let imageVideoArrayObject = Object.values(data_array)
        const arrayLength = imageVideoArrayObject.length
        let response = []

        for (let index = 0; index < arrayLength; index++) {
            const element = imageVideoArrayObject[index];
            if(typeof(element) == "object" ) response.push(element)
        }
        return response
    }

    checkThumbnailImages = async(data_array:Array<RawObject>) =>{
        let validDataArray = [] 
        for (let index = 0; index < data_array.length; index++) {
            const element = data_array[index];
            try {
                await thumbnailsImageExists(element.video_image_field_thumbnail)
                validDataArray.push(element)
            } catch (error) {
                const newDataObject:RawObject = {
                    video_image_field_original:element.video_image_field_original,
                    video_image_field_thumbnail:noPreviewImageThumbnails
                }
                validDataArray.push(newDataObject)                
            }          
        }
       return validDataArray
    }

    createTempleateProps = async (props,response) =>{
        const templateProps:TemplateProps = {
            allowLoginType:props.allow_login_type,
            count:0,
            data_array:await this.checkThumbnailImages(response.data.video_image),
            mark:response.data.current_given_mark,
            submission_id:response.data.submission_id,
            type:props.voting_type,
            title:response.data.title,
            category:response.data.category,
            form_fields:response.data.form_fields,
            subUrl:props.suburl,
            staticUrl:props.staticUrl,
            next:response.data.next,
            prev:response.data.prev,
            total_vote:response.data.total_vote,
            disibleVotingCount:this.props.disibleVotingCount,
            votingTypeDetail:this.props.votingTypeDetail,
        }
        return templateProps
    }
    ApiCall=async (props:any) =>{
        if(this.state.showDeatils)this.setState({showDeatils:false})
        const { defaultApiUrl,voter_id } = props
        const { submission } = props.match.params
        const pathParams = `/${defaultApiUrl}/${submission}`
        const params = {voter_id}
        try {
            const response = await API.getDeatils({pathParams,params})
            const  templateProps = await this.createTempleateProps(props,response)      
            this.setState({templateProps,showDeatils:true})     
        } catch (error) {
            this.props.alertBoxAction(error.message,true)
        }
       
       
    }
    componentDidMount(){
        this.ApiCall(this.props)
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        const original_submission = this.props.match.params.submission
        const new_submission = nextProps.match.params.submission
        if(original_submission != new_submission) this.ApiCall(nextProps)
        if(this.props.loginStatus != nextProps.loginStatus)this.ApiCall(nextProps)           
    }

    render(){
        if(!this.state.showDeatils) return <ListLoader load={true}/> 
        return <div id={"event_id_"+this.props.headerData.event_id+"details"}>
            <SimpleTemplate props={this.state.templateProps} /></div>
    }

}

const mapStateToProps = (state) =>{
    return {
        defaultApiUrl:state.defaultApiUrl,
        allow_login_type:state.headerData.allow_login_type,
        loginDialogState:state.loginDialog,
        loginStatus:state.Authorize,
        voter_id:state.voter_id,
        voting_type:state.headerData.voting_type,
        headerData:state.headerData,
        suburl:state.suburl,
        staticUrl:state.staticUrl,
        disibleVotingCount:state.headerData.show_voting_status,
        votingTypeDetail:state.headerData.voting_type_detail,
    }
  }

  const mapDispatchToProps = (dispatch) =>{
    return {
        loginDialogOpen: (status) => dispatch(Action.get(Action.type.LoginDialog,status)),
        SetCurrentPageName: () => dispatch(Action.get(Action.type.currentPage,PAGE_NAME.DETAILS_PAGE)),
        alertBoxAction: (message,status) => dispatch(alertBoxAction({Message:message,open:status}))
    }
  }

  export default connect(mapStateToProps,mapDispatchToProps)(Deatils)