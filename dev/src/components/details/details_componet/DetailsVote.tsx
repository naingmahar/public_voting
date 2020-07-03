import * as React from 'react';
import VoteUi from '../../common/VotingType'
import {VotingType} from '../../../resource/app.setting'
import { SocialShareType } from '../../common/common.types';

const {VoteManager} = VoteUi


class SocialShare extends React.Component<SocialShareType,any>{
    state={
        count:0
    }

    UNSAFE_componentWillMount(){
        this.setState({count:this.props.count||0})
    }

    setTotalVote = (count) =>{
        this.setState({count:count||0})
    }

    render(){
        return(
            <div className="row">
                <div className="col s12 center">
                    <h4>{this.props.countDisible ? this.state.count : ""}</h4>             
                </div>
                <div className="col s12 center">
                    <VoteManager 
                        type={this.props.type} 
                        mark={this.props.mark} 
                        submission_id={this.props.submission_id} 
                        setTotalVote={this.setTotalVote} 
                        votingTypeDetail={this.props.votingTypeDetail} />
                    {/* {Vote({...this.props,action:this.setTotalVote})} */}
                </div>
            </div>    
        )
    }
}


export default SocialShare