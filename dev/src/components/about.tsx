import * as React from 'react'
import {connect} from 'react-redux'
import * as Action  from '../action'
import api from '../api'
import { PAGE_NAME } from '../resource/message'
import ListLoader from './common/ListLoading'

class about extends React.Component<any,any>{

    state={
        about:""
    }

    apiCall= async () =>{
        const respose = await api.getAbout(this.props.defaultUrl)
        this.setState({about:respose.data.about_text||"<span/>"})
    }

    componentDidMount(){
        this.props.SetCurrentPageName()
        this.apiCall()
    }

    render(){
        if(!this.state.about) return <ListLoader load={true}/>
        return(
            <div id="about" className="container" style={{minHeight:"50vh"}}>
                <h4 className="center-align">{this.props.title}</h4>
                <div dangerouslySetInnerHTML={{__html: this.state.about}} />
            </div>
        )
    }
}


const mapStateToProps = (state) =>{
    return {
      title:state.headerData.title,
      defaultUrl:state.defaultApiUrl
    }
}

const mapDispatchToProps = (dispatch) =>{
    return {
        SetCurrentPageName: () => dispatch(Action.get(Action.type.currentPage,PAGE_NAME.ABOUT_PAGE))
    }
  }
  
export default connect(mapStateToProps,mapDispatchToProps)(about)
