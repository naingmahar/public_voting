import * as React from 'react';
import CardList from './CardList'
import {connect} from 'react-redux'
import ListLoader from '../common/ListLoading'
import ScrollLoader from './SlideLoding'
import Filter from './Filter'
import * as $ from 'jquery' 
import * as Action from '../../action'
import {getSubmissionList, alertBoxAction} from '../../action/common.action'
import {Setting} from '../../resource/app.setting'
import API from '../../api';
import {SubmissionObjectType,SubmissionsType,VideoImageType} from './List.Model'
import { PAGE_NAME } from '../../resource/message';
import { CategoriesConvertModel } from '../../Model/categories.model';
import { filterCallBackType } from '../common/common.types';
import NotFound from '../common/NotFound';
import MobileFilter from './MobileFilter';
// import {
//     BrowserView,
//     MobileView,
//     isBrowser,
//     isMobile
//   } from "react-device-detect";

interface VotingListState{
        waitApiCall : Boolean,
        allowApiCall:Boolean,
        totalLength : Number,
        currentLength : Number,
        submissions:Array<SubmissionsType> | Array<any>,
        loginStatus:any,
        categories:Array<CategoriesConvertModel>,
        filter?:filterCallBackType,
        message?:string
}
class VotingList extends React.Component<any,VotingListState>{ 

    state = {
        waitApiCall : false,
        allowApiCall: true,
        totalLength : 0,
        currentLength : 0,
        submissions:[],
        loginStatus:false,
        categories:[],
        message:"",
        filter:{category:"",sort:"",search:"",uuid:""}
    }

    UNSAFE_componentWillMount(){
        this.props.SetCurrentPageName()
        $(".header").addClass("addHeaderPadding")
    }

    filterCallback = (filter:filterCallBackType) =>{
        this.setState({
            totalLength : 0,
            currentLength : 0,
            submissions:[],
            allowApiCall: true,
            waitApiCall : false,
            filter:filter
        },()=>this.apiCall())
    }


    componentDidMount(){
        let cache:VotingListState = this.props.Cache
        this.setState({loginStatus:this.props.loginStatus}) 
        API.getCategory(this.props.deafultApiUrl).then((categoryResponse)=>{
            this.setState({categories:categoryResponse})
        }).catch(error=>{
            alert(error.message)
        })
        if(cache && cache.submissions && cache.submissions.length > 0) {
            this.setState(cache)
            this.props.RestoreHeaderData()
        }
        else this.apiCall()
    }

    scrollUrlCheck = () => {
        const url = window.location.href
        let urlArray = url.split("/")
        const status = urlArray[urlArray.length-1] == this.props.suburl ? true :false
        return status
    }

    arrayConcat = (currentArray:Array<any>,newArray:Array<any>) =>{
        return currentArray.concat(newArray)
    }

    apiCall = async () =>{
        if(this.state.waitApiCall == true) return
        await this.setState({waitApiCall:true,message:""})
        const start = this.state.currentLength
        const limit = Setting.deafultLimit
        let payload = {start,limit}
        payload['voter_id'] = this.props.voterId || ""
        payload['category'] = this.state.filter.category || ""
        payload['search'] = this.state.filter.search || ""
        payload['sort'] = this.state.filter.sort || ""
        try {
            const response = await API.getSubmissionList(payload,this.props.deafultApiUrl)
            const data:SubmissionObjectType = response.data
    
            const submissions = this.arrayConcat(this.state.submissions,data.submissions)
            if(!this.state.waitApiCall) return
            if(!data.success) {
                await this.setState({message:data.msg||"Not Found"})
                return
            }
            if(data.submissions.length < Setting.deafultLimit ) await this.setState({allowApiCall:false})
            if(data.submissions.length == 0 && this.state.submissions.length == 0) {
                await this.setState({message:data.msg||"Not Found"});
                return
            } 
            await this.setState({ 
                waitApiCall:false,
                currentLength:this.state.currentLength+data.submissions.length,
                totalLength:data.total_shortlisted_submission,
                submissions
            })
        } catch (error) {
            this.props.alertBoxAction(error.message,true)
        }
    }

    scollWorker = () =>{
        const documentHigh =  $(document).height()
        const ScrollPosition = window.scrollY + window.innerHeight
        const scrollAtBottom = Math.floor((documentHigh - ScrollPosition )) >= 100 ? false : true 

        const currentPath = window.location.href
        const urlArray = currentPath.split("/")

        if(scrollAtBottom && !this.state.waitApiCall && this.state.allowApiCall && urlArray[urlArray.length -1] == this.props.suburl){
            if(this.state.totalLength > this.state.currentLength) this.apiCall()
        }
        
    }

    UNSAFE_componentWillReceiveProps(nextProps){
        if(this.state.loginStatus != nextProps.loginStatus){
            this.setState({
                submissions:[],
                loginStatus:nextProps.loginStatus,
                currentLength:0
            },()=>this.apiCall())           
        }
    }

    render(){
        window.addEventListener("scroll",this.scollWorker)  
        let ui = <ListLoader load={true}/>
        if(this.props.active != 1){
            ui = <NotFound load={true} message={"Voting round is not active"}/>
        }else if(this.props.isVotingRoundClosed){
            ui = <NotFound load={true} message={"Voting round is closed"}/>
        }else if(this.state.message){
            ui = <NotFound load={true} message={this.state.message}/>
        }else if(!this.state.submissions || !this.state.submissions.length){
            ui = <ListLoader load={true}/>
        }else{
            ui = (
                <div>
                    <CardList list={this.state.submissions} type={this.props.votingType} filterCallBack={this.filterCallback}  votingTypeDetail={this.props.votingTypeDetail}/>
                    <ScrollLoader load={this.state.waitApiCall}/>
                </div>
            )    
        }
       
        return(
            <div id={"event_id_"+this.props.event_id+"listing"}>
                <MobileFilter filter={this.state.filter} categories={this.state.categories} callBack={this.filterCallback} />
                <Filter filter={this.state.filter} categories={this.state.categories} callBack={this.filterCallback} />
                {ui}    
            </div>
            
        )
    }

    componentWillUnmount(){
        $(".header").removeClass("addHeaderPadding") 
    }


}


const mapStateToProps = (state) =>{
    return {
        Cache:state.cache,
        isVotingRoundClosed:state.isVotingRoundClosed,
        SubmissionList:state.submissions,
        deafultApiUrl:state.defaultApiUrl,
        suburl:state.suburl,
        votingType:state.headerData.voting_type,
        votingTypeDetail:state.headerData.voting_type_detail,
        active:state.headerData.active,
        end_date:state.headerData.end_date,
        loginStatus:state.Authorize,
        voterId:state.voter_id,
        event_id:state.headerData.event_id
    }
  }

  const mapDispatchToProps = (dispatch) =>{
    return {
        StoreCache: (state) => dispatch(Action.get(Action.type.Cache,state)),
        getSubmissionList:async (deafultApiUrl,{start,limit,voter_id}) => dispatch(await getSubmissionList({deafultApiUrl},{start,limit})),
        RestoreHeaderData: () => dispatch(Action.get(Action.type.RestoreHeaderData,{})),
        SetCurrentPageName: () => dispatch(Action.get(Action.type.currentPage,PAGE_NAME.LIST_PAGE)),
        alertBoxAction: (message,status) => dispatch(alertBoxAction({Message:message,open:status}))
    }
  }

  export default connect(mapStateToProps,mapDispatchToProps)(VotingList)  
  