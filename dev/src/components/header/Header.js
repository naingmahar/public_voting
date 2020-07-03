import React from 'react';
import {connect} from 'react-redux'
import BannerTitle from './BannerTittle'
import BannerDate from './BannerDate'
import ShareEvent from './ShareEvent'
import ContestEnd from './ContestEnd'
import Navbar from './Nav'
import * as Action from '../../action'
import {PAGE_NAME} from '../../resource/message'
class Header extends React.Component {
  
  state={
    headerData:{},
    currentPage:""
  }

  UNSAFE_componentWillReceiveProps(nextProps){
    this.setState({headerData:this.props.headerData})
    if(nextProps.currentPage == PAGE_NAME.DETAILS_PAGE || nextProps.currentPage == PAGE_NAME.ABOUT_PAGE) this.hideHeaderItems()
    this.setState({currentPage:nextProps.currentPage}) 
  }

  hideHeaderItems = () =>{
    const headerData = this.props.headerData
    const convertData = {...headerData,...{
        show_duration: "0",
        show_label: "0",
        show_sharethis: "0",
        show_time_left: "0",
        show_title: "0",
        show_voting_status: "0",
    }}
    this.setState({headerData:convertData})
  }

    render() {
      const {
        banner,title,text_color,start_date,end_date,shareicon_color,allow_login_type,show_time_left,show_duration,show_sharethis,show_title
      } = this.state.headerData
      
      return (
        <div className="header addHeaderPadding" style={{backgroundImage: `url(${banner})`}} >
                <div className="nav-content">
                  <div className="row">
                      <div className="col s8 xl4 offset-s2 offset-xl4 white center">
                        <Navbar 
                          auth={this.props.auth} 
                          curretPage={this.props.currentPage} 
                          logout={this.props.Logout} 
                          staticUrl={this.props.staticUrl} 
                          suburl={this.props.url} 
                          allowLoginType={allow_login_type} />
                      </div>
                  </div>

                  <div className="row">
                    <div className="col xl8 s12 ">
                        <div className="row responsive-control">
                          <div className="col s12">
                            <BannerTitle show={show_title} title={title} text_color={text_color} />
                          </div>
                          <div className="col s12">
                            <BannerDate show={show_duration} startDate={start_date} endDate={end_date} text_color={text_color}/>
                          </div>
                        </div>
                    </div>
                    <div className="col xl3 s12 offset-xl1">
                      <div className="row ">
                        <div className="col s12">
                          <ShareEvent show={show_sharethis} title={title} allowLoginType={allow_login_type} shareicon_color={shareicon_color} text_color={text_color}/>
                        </div>
                        <div className="col s12">
                          <ContestEnd show_time_left={show_time_left} startDate={start_date} endDate={end_date} text_color={text_color}/>
                        </div>
                      </div>
                    </div>
                  </div>

              </div>
          
        </div>
      )
    }
}

const mapStateToProps = (state) =>{
  return {headerData:state.headerData,auth:state.Authorize,backupHeaderData:state.backupHeaderData,currentPage:state.currentPage,staticUrl:state.staticUrl}
}

const mapDispatchToProps = (dispatch) =>{
  return {
    updateHeaderData: (props) => dispatch(Action.get(Action.type.HeaderData,props)),
    Logout: () => dispatch(Action.get(Action.type.LogoutBox,true)),
  }
}

export default connect(mapStateToProps,mapDispatchToProps)(Header)