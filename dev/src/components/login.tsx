import * as React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {FaFacebook,FaGooglePlus,FaLinkedin,FaTwitter} from "react-icons/fa";
import {CommonText,AppColor,AppIconSize} from '../resource/app.setting'
import { withStyles } from '@material-ui/styles';
import {getAnonymousData,SaveVoter,getLinkedin} from '../action/common.action'
import {connect} from 'react-redux'
import {Dialog,
        DialogTitle,
        DialogContent,
        List,
        ListItem,
        ListItemText,
        Avatar,
        ListItemAvatar,
        Typography,
      Container } from '@material-ui/core';
import * as Action from '../action/index'
import * as hello from 'hellojs'
import {SocialType, SaveVoterType, SaveVoterModel,SocalMediaType} from './common/Auth.Model'
import {config} from "../../config"

const useStyles = makeStyles(theme => ({
        root: {
          width: '100%',
          backgroundColor: theme.palette.background.paper,
        },
        unknown_Background:{
          "background-color": "rgb(93, 166, 38)"
        },
        model_size:{
          paddingLeft:"5vw",
          paddingRight:"5vw"
        }
      }));


class LoginDialog extends React.Component<any,any> {
  
  constructor(props) {
    super(props); 
  }

  UNSAFE_componentWillMount(){
      hello.init({
        facebook: config().FACEBOOK,
        linkedin:config().LINKEDIN,
        twitter:config().TWITTER,
        google:config().GOOGLE,
    }, {redirect_uri: config().REDIRECT_URL,scope: 'email'});
  }

  
  handleClose = () => this.props.onClose(this.props.selectedValue);
  
  
  anonymousLogin = () =>{
    this.handleClose()
    this.props.getAnonymousData()
  }


  callSaveVoterApi =(socialResponse:SocialType,referer:String) =>{
    const SaveVoter = new SaveVoterModel()
    const payload = SaveVoter.create(socialResponse,referer)
    this.props.addVoter(payload)
  } 

  SocialMediaLogin =async (mediaName) =>{
    try {
      const facebookResponse = await hello(mediaName).login()
      let userData:SocialType = {
                      email: "",
                      first_name: "",
                      last_name: "",
                      name: "",
                      id: "",
                      picture:"",
                      thumbnail:""
                  }
     
      if(mediaName != "linkedin"){
         userData = await hello(mediaName).api("me")
      }else{
          let id = facebookResponse.authResponse["client_id"]
          let token = facebookResponse.authResponse.access_token
        
          let payload = {id : id, token : token}  
          let linkedinData = await this.props.getLinkedin(payload)
          userData = linkedinData.data.linkedinList          
      }
      
      this.handleClose()
      this.callSaveVoterApi(userData,mediaName)

    } catch (error) {
      this.handleClose()
      console.error(error)
    }
    
  }


  ListBox = (type) =>{
    const {classes} = this.props
    const ICON_UI = {
      FACEBOOK:<FaFacebook color={AppColor.FACEBOOK} size={AppIconSize.LOGIN}/>,
      LINKEDIN:<FaLinkedin color={AppColor.LINKEDIN} size={AppIconSize.LOGIN}/>,
      TWITTER:<FaTwitter color={AppColor.TWITTER} size={AppIconSize.LOGIN}/>,
      GOOGLE:<FaGooglePlus color={AppColor.GOOGLE} size={AppIconSize.LOGIN}/>,
      ANONYMOUS:<Avatar className={classes.unknown_Background} color={AppColor.ANONYMOUS}><Typography >Ano</Typography></Avatar>
    }
   
    return (
      <ListItem key={type} button onClick={ type != "ANONYMOUS" ?()=>this.SocialMediaLogin(String(type).toLowerCase()) : ()=>this.anonymousLogin()}>
        <ListItemAvatar>
          {ICON_UI[type]}
        </ListItemAvatar>
        <ListItemText primary={CommonText[type]} />
      </ListItem>
    )
  }

  LoginButtons = () =>{
    const {allowLoginType} = this.props
    let shareUi = []
    const login = ["FACEBOOK","TWITTER","LINKEDIN","ANONYMOUS","GOOGLE"]
    login.map(socialMedia => {
          if(allowLoginType && allowLoginType.search(socialMedia) != -1) shareUi.push(this.ListBox(socialMedia)) 
    })
    return shareUi
  }
  

  render(){
    const {open} = this.props;
    const {classes} = this.props

    return ( 
      <Dialog  onClose={this.handleClose} aria-labelledby="customized-dialog-title" open={open}>
        <DialogTitle id="customized-dialog-title" >Login</DialogTitle>
        <DialogContent>
          <Container className={classes.model_size} >
            <div className="empty"/>
            <List component="big" className={classes.root} aria-label="mailbox folders">
              {this.LoginButtons()}
            </List>
          </Container>
        </DialogContent>
        <DialogContent/>
      </Dialog> 
      
    )
  }
}
const LoginModel = (props) => {

  const handleClickOpen = () => props.loginDialogOpen(true)
  const handleClose = () =>props.loginDialogOpen(false)

  return (
    <div>
      <a color="primary" onClick={handleClickOpen}>Login</a>
      <LoginDialog  
            open={props.loginDialogState} 
            allowLoginType={props.allowLoginType} 
            onClose={handleClose} 
            getAnonymousData={props.getAnonymousData}
            getLinkedin={props.getLinkedin}
            addVoter={props.addVoter}
            classes={useStyles} 
      />
    </div>
  );
}

const mapStateToProps = (state) =>{
  return {
    allowLoginType:state.headerData.allow_login_type,
    loginDialogState:state.loginDialog,
    staticUrl:state.staticUrl
  }
}

const mapDispatchToProps = (dispatch) =>{
  return {
    loginDialogOpen: (status) => dispatch(Action.get(Action.type.LoginDialog,status)),
    getAnonymousData:async () => dispatch(await getAnonymousData()),
    addVoter:async (payload) => dispatch(await SaveVoter(payload)),
    getLinkedin:async ({id, token}) => dispatch(await getLinkedin({id, token})),
  }
}

export default connect(mapStateToProps,mapDispatchToProps)(LoginModel)