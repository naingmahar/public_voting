import {Rating,} from '@material-ui/lab';
import * as React from 'react'
import '../../../style/materialIcon.css'
import '../../../style/roboto.css'
import { withStyles } from '@material-ui/core/styles';
import StarBorderIcon from '@material-ui/icons/Star';
import {FaRegThumbsUp,FaRegThumbsDown,FaThumbsUp,FaThumbsDown,FaCheck} from "react-icons/fa";
import {connect} from 'react-redux'
import API from '../../api'
import * as $ from 'jquery'
import LoginDialog from '../login'
import * as Action from '../../action'
import { alertBoxAction } from '../../action/common.action';
import { VotingType } from '../../resource/app.setting';

const StyledRating = withStyles({
    iconFilled: {
      color: '#ffb400',
    },
    iconHover: {
      color: '#ffb400',
    },

  })(Rating);


class VoteManger extends React.Component<any,any>{
    voteButton = () => {
        const {type,mark,submission_id,votingTypeDetail} = this.props
        if(type == VotingType.Rating) return  <RatingVote mark={mark} submission_id={submission_id} voteAction={this.loginValidate} votingTypeDetail={votingTypeDetail} /> 
        if(type == VotingType.YesNo) return  <YesNoVote mark={mark} submission_id={submission_id} voteAction={this.loginValidate}/> 
        return  <SelectionButton mark={mark} submission_id={submission_id} voteAction={this.loginValidate}/> 
    }

    vote = async (params) => {
        return new Promise(async (res,rej)=>{
            API.saveVotingResult({...this.props,...params})
                .then((response)=>{
                    if(!response.data.success) return rej(response.data.msg)
                    if(response.data.total_vote && this.props.setTotalVote) this.props.setTotalVote(response.data.total_vote)
                })
                .catch(error=>{
                    return rej(error.message)
                })
            
        })
    }

    loginValidate = async (params) =>{
        if( !this.props.voter_id || this.props.voter_id == 0 ){
            this.props.loginDialogOpen(true)
            return false
        }
        if(String(this.props.voter_id).length >= 1){
            try {
                await this.vote(params) 
                return true  
            } catch (error) {
                alert(error || "Please Retry Again")
                return false            
            }
        }
    }


    render(){
        return this.voteButton()
    }
}

type buttonPayloadType ={
    submission_id:string|number
    mark:number
    voteAction:Function
}

class SelectionButton extends React.Component<buttonPayloadType,any>{
    state={
        submission_id:"",
        mark:0
    }
    UNSAFE_componentWillMount(){
        this.setState({
            submission_id:this.props.submission_id,
            mark:this.props.mark||0
        })
    }
    handleClick= async () =>{
        const voteReverse = async () => await this.setState({mark: this.state.mark == 1? 0 : 1})
        await voteReverse()
        let actionstatus = await this.props.voteAction({mark:this.state.mark,submission_id:this.state.submission_id})
        if(actionstatus==false) await voteReverse() 
    }

    
    render(){
        let staticClass = "waves-effect waves-light lighten-5 btn center-align"
        let voteButtonClass= this.state.mark == 1? staticClass+" vote":staticClass

        return(<div className="vote-selection">
                    <button className={voteButtonClass} onClick={this.handleClick}>
                        <div className="selection_vote_text">{this.state.mark == 1?<i className="material-icons left vote">check</i>:<span></span>}Vote</div>
                    </button>
                </div>
        )
    }
}

class Selection extends React.Component<any,any>{
    state={
        submission_id:"",
        mark:0
    }
    UNSAFE_componentWillMount(){
        this.setState({
            submission_id:this.props.submission_id,
            mark:this.props.mark||0
        })
    }
    vote = async () => {

        try {
            const params:any = {...this.props,...{mark:this.state.mark,submission_id:this.state.submission_id}}
            const response  = await API.saveVotingResult(params)   
            if(!response.data.success) throw new Error(response.data.msg || "Please Retry Again")
            if(response.data.total_vote && this.props.action) this.props.action(response.data.total_vote)
        } catch (error) {
            this.props.alertBoxAction(error.message || "Please Retry Again",true)
            throw error
        }
    }
    handleClick= async () =>{
        const voteReverse = async () => await this.setState({mark: this.state.mark == 1? 0 : 1})

        if(this.props.voter_id == 0){
            this.props.loginDialogOpen(true)
        }
        if(this.props.voter_id >= 1){
            await voteReverse()
            try {
                await this.vote()   
            } catch (error) {
                voteReverse()
            }
        }
    }

    
    render(){
        let staticClass = "waves-effect waves-light lighten-5 btn center-align"
        let voteButtonClass= this.state.mark == 1? staticClass+" vote":staticClass

        return(<div className="vote-selection">
                    <button className={voteButtonClass} onClick={this.handleClick}>
                        <div className="selection_vote_text">{this.state.mark == 1?<i className="material-icons left vote">check</i>:<span></span>}Vote</div>
                    </button>
                </div>
        )
    }
}

class YesNoVote extends React.Component<any,any>{

    private likeColor = "#2962ff"
    private noActionColor =  "#9e9e9e"
    private unLikeColor = "#ff6d00"
    state={
        submission_id:"",
        like:0,
        likeColor:this.likeColor,
        unlikeColor: this.unLikeColor
    }


    componentDidMount(){
        this.setState({
            submission_id:this.props.submission_id,
            like:this.props.mark||0,
            likeColor: this.props.mark == 1 ? this.likeColor : this.noActionColor,
            unlikeColor: this.props.mark == -1 ? this.unLikeColor : this.noActionColor
        })
    }
    voteReverse = async (likeAction) => {
        await this.setState({like: this.state.like != 0 && likeAction==this.state.like  ? 0 : likeAction})
        await this.setState({
            likeColor: this.state.like == 1 ? this.likeColor :this.noActionColor,
            unlikeColor: this.state.like == -1 ? this.unLikeColor: this.noActionColor
        })
        return
    }


    action = async(like) =>{
        await this.voteReverse(like)
        let actionstatus = await this.props.voteAction({mark:this.state.like,submission_id:this.state.submission_id})
        if(actionstatus==false) await this.voteReverse(like)
    }

    render(){
        return(
                <div className="row remove-margin">
                    <div className="col s3 xl3 offset-s3 offset-xl3 center-align">
                        <a onClick={e=>{this.action(1);e.preventDefault()}} href="#">
                            <FaThumbsUp color={this.state.likeColor} size="25" />
                        </a>
                    </div>
                    <div className="col s3 xl3 center-align">
                        <a onClick={e=>{this.action(-1);e.preventDefault()}} href="#">
                            <FaThumbsDown color={this.state.unlikeColor} size="25"/>
                        </a>
                    </div>
                </div>
        )
    }
}

class RatingVote extends React.Component<any,any>{
    state={
        submission_id:"",
        mark:0
    }
    componentDidMount(){
        this.setState({
            submission_id:this.props.submission_id,
            mark:parseInt(this.props.mark) > 0 ? parseInt(this.props.mark): 0 ,
        })
    }

    action = async(event, newValue) =>{
        const oldValue = this.state.mark
        await this.setState({mark:newValue})
        let actionstatus = await this.props.voteAction({mark:this.state.mark,submission_id:this.state.submission_id})
        if(!actionstatus)  await this.setState({mark:oldValue})
    }

    render(){
        let max = 5
        
        if(this.props.votingTypeDetail){
            let uiSetting = JSON.parse(this.props.votingTypeDetail)
            max = parseInt(uiSetting.max_points)
            console.log("UI ..........",uiSetting.max_points)
        }
        return(
            <div className="row remove-margin center-align">
                <div className="center-box">
                    <StyledRating
                        max={max}
                        name={this.state.submission_id}
                        precision={1}
                        icon={<StarBorderIcon fontSize="large" />}
                        value={this.state.mark}
                        onChange={this.action}

                    />
                </div>
            </div>

        )
    }
}

const mapStateToProps = (state) =>{
    return {
        voter_id:state.voter_id,
        voting_round_id:state.voting_round_id,
        allow_login_type:state.headerData.allow_login_type,
        loginDialogState:state.loginDialog
    }
}
const mapDispatchToProps = (dispatch) =>{
    return {
      loginDialogOpen: (status) => dispatch(Action.get(Action.type.LoginDialog,status)),
      alertBoxAction: (message,status) => dispatch(alertBoxAction({Message:message,open:status}))
    }
  }

export default {
    // RatingVote:connect(mapStateToProps)(RatingVote),
    // YesNoVote:connect(mapStateToProps)(YesNoVote),
    Selection:connect(mapStateToProps,mapDispatchToProps)(Selection),  
    VoteManager:connect(mapStateToProps,mapDispatchToProps)(VoteManger)
}
