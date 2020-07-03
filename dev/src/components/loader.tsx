import *  as React from 'react'
import '../../style/loader.css'
import {connect} from 'react-redux'
import * as Action  from '../action'
import {initial,getSubmissionList} from '../action/common.action'
import { JellyfishSpinner,MagicSpinner } from "react-spinners-kit";
import {FaExclamationCircle} from "react-icons/fa";
import {Setting} from '../resource/app.setting'
import {ErrorPage} from './ErrorPage'
import { ServerError } from './ErrorPage/500'
import { SocialLogin } from './ErrorPage/Social Login'

class Loader extends React.Component<any,any>{ 
  
  state = {
    loading: true,
    eventId:0,
    error:{status:0,message:""}
  };

  componentDidMount(){     
    this.props.addVoteUrl(this.props.url)
    this.props.addVoteStaticUrl(this.props.staticurl)
    this.props.initialCall(this.props.url)
  }
  UNSAFE_componentWillReceiveProps(nextProps){
    if(nextProps.event_id > 0){
      // this.props.getSubmissionList(nextProps,Setting.skipLimit(0))
      this.props.disibleLoader(0)
    }
    if(nextProps.error && nextProps.error.status > 0){
      this.setState({error:nextProps.error})
    }  
  }

  render() {
    let purifyUrl = ""
    if(this.props.url) purifyUrl= this.props.url.split("?")[0].split("#")[0]

    if(purifyUrl == "social_login") return <SocialLogin />
    if(this.state.error.status == 404)return <ErrorPage message="Page not found" />
    if(this.state.error.status > 0)return <ErrorPage message={this.state.error.message || "Please Retry Again"} />
    return (
      <div id="loader">
          <JellyfishSpinner size={200} color="#fff" loading={true}/>
      </div>  
  
    ) 
  }
}

const mapStateToProps = (state) =>{
  return {
    event_id:state.event_id,
    voting_round_id:state.voting_round_id,
    suburl:state.suburl,
    error:state.Error,
    staticUrl:state.staticUrl
  }
}


const mapDispatchToProps = (dispatch) =>{
  return {
      addVoteStaticUrl: (staticurl) => dispatch(Action.get(Action.type.addStaticUrl,staticurl)),
      addVoteUrl: (suburl) => dispatch(Action.get(Action.type.addSuburl,suburl)),
      addEventId: (eventId) => dispatch(Action.get(Action.type.addeventId,eventId)),
      addVotingRoundId: (votingRoundId) => dispatch(Action.get(Action.type.addvotingRoungId,votingRoundId)),
      initialCall:async (suburl) => dispatch(await initial(suburl)),
      // getSubmissionList:async ({event_id,voting_round_id},{start,limit}) => dispatch(await getSubmissionList({event_id,voting_round_id},{start,limit})),
  }
}

export default  connect(mapStateToProps,mapDispatchToProps)(Loader)
