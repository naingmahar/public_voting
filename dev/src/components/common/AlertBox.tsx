import * as React from 'react'
import {FaExclamationTriangle,FaInfoCircle, FaSignOutAlt} from "react-icons/fa";
import {connect} from 'react-redux'
import * as Action from '../../action'
import { useTheme } from '@material-ui/core/styles';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Container } from '@material-ui/core';
import { AlertColor } from '../../resource/app.theme.color';
import { alertBoxAction } from '../../action/common.action';
import { DialogParamType } from './common.types';
import * as $ from 'jquery'

function ErrorDialog(param:DialogParamType) {
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
    // setOpen(param.open)

    const handleClose = () => {
      param.close()
      //setOpen(false);
    };

    const style : any = {
      actionFrame:{padding:0,textAlign: 'center'},
      buttonFrame:{width:"100%",backgroundColor: AlertColor.buttonColor,color:AlertColor.buttonTextColor,padding:"10px"}
    }
  
    return (
      <div className="dialog-alert">
        <Dialog
          open={param.open}
          onClose={handleClose}
        >
          <div className="dialog-alert">
            <DialogContent>
                <div className="center-align">
                    <FaExclamationTriangle color={AlertColor.iconColor} size={32} />
                </div>
            </DialogContent>
            <DialogContent>
              <div className="alertFrame">
                <DialogContentText style={{color:AlertColor.textColor}}>{param.Message}</DialogContentText>
              </div>
            </DialogContent>
            <DialogContent style={style.actionFrame}>
                <a href='#' onClick={e=>{handleClose();e.preventDefault()}}>
                    <div style={style.buttonFrame}>Dismiss</div>
                </a>
            </DialogContent>
          </div>  
        </Dialog>
      </div>
    );
  }

  function ConfirmDialog(param:DialogParamType) {
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
    // setOpen(param.open)

    const handleClose = () => {
      param.mutpileClose.close()
    };

    const style : any = {
      alertFrame:{width:"18vw",textAlign: 'center'},
      actionFrame:{padding:0,textAlign: 'center'},
      buttonFrame:{width:"100%",backgroundColor: AlertColor.buttonColor,color:AlertColor.buttonTextColor,padding:"10px",borderRadius: "25px"}
    }

    return (
      <div>
        <Dialog
          fullScreen={false}
          open={param.open}
          onClose={handleClose}
        >
            <DialogContent>
                <div className="center-align">
                    {param.icon ? param.icon:<FaInfoCircle color={AlertColor.iconColor} size={32} />}
                </div>
            </DialogContent>
            <DialogContent>
              <div className="alertFrame">
                <DialogContentText style={{color:AlertColor.textColor}}>{param.Message}</DialogContentText>
              </div>
            </DialogContent>
            <DialogContent style={style.actionFrame}>
                <div className="row">
                  <div className="col s6">
                    <a href='#' onClick={e=> {param.mutpileClose.close();e.preventDefault()}}>
                      <div style={style.buttonFrame}>{param.buttonText&&param.buttonText[0]?param.buttonText[0]:'Cancel'}</div>
                    </a>
                  </div>
                  <div className="col s6">
                    <a href='#' onClick={e=>{param.mutpileClose.confirm();e.preventDefault()}}>
                      <div style={style.buttonFrame}>{param.buttonText&&param.buttonText[1]?param.buttonText[1]:'Confirm'}</div>
                    </a>
                  </div>
                </div>
            </DialogContent>
        </Dialog>
      </div>
    );
  }

  class ConfirmBox extends React.Component<DialogParamType,any>{
    state={
      open:false,
      message:""
    }

    UNSAFE_componentWillReceiveProps(nextProps){
      const payload:DialogParamType = nextProps
      this.setState({
        open:payload.open,
        message:payload.Message
      })
    }

    closeAlertBoxAndLogout = () =>{
      this.props.mutpileClose.confirm()
      this.setState({open:false})
      this.props.mutpileClose.close()
    }

    closeAlertBox = () =>{
      this.setState({open:false})
      this.props.mutpileClose.close()
    }

    render(){
        return <ConfirmDialog 
                  Message={this.state.message} 
                  buttonText={this.props.buttonText} 
                  icon={this.props.icon} 
                  open={this.state.open} 
                  mutpileClose={{close:this.closeAlertBox,confirm:this.closeAlertBoxAndLogout}} 
                />
    }
}

class AlertBox extends React.Component<any,any>{
    state={
      open:false,
      message:"Please retry again"
    }

    UNSAFE_componentWillReceiveProps(nextProps){
      const payload:DialogParamType = nextProps.payload
      this.setState({
        open:payload.open||false,
        message:payload.Message||"Please retry again"
      })
    }

    closeAlertBox = () =>{
      this.props.alertBoxAction("",false)
      this.setState({open:false})
    }

    render(){
        return <ErrorDialog Message={this.state.message} open={this.state.open} close={this.closeAlertBox} />
    }
}

class LogoutConfirmBox extends React.Component<any,any>{

  render(){
    return(
      <ConfirmBox  
        Message={"Are you sure you want to logout?"} 
        open={this.props.logoutBox|| false} 
        mutpileClose={{close:this.props.CloseLogoutBox,confirm:this.props.Logout}}
        buttonText={["Cancel","Logout"]} 
        icon={<FaSignOutAlt color={AlertColor.iconColor} size={32}/>}  
      />
    )
  }
}


const mapStateToProps = (state) =>{
    return {
        payload:state.alertPayload,
        logoutBox:state.logoutBox
    }
}
const mapDispatchToProps = (dispatch) =>{
    return {
      alertBoxAction: (message,status) => dispatch(alertBoxAction({Message:message,open:status})),
      Logout: () => dispatch(Action.get(Action.type.logout,true)),
      CloseLogoutBox: () => dispatch(Action.get(Action.type.LogoutBox,false)),
    }
  }

export default {
  ErrorBox:connect(mapStateToProps,mapDispatchToProps)(AlertBox),
  ConfirmBox:ConfirmBox,
  LogoutConfirmBox:connect(mapStateToProps,mapDispatchToProps)(LogoutConfirmBox),
}
