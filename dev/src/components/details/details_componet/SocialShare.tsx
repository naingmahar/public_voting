import * as React from 'react';
import {FaFacebook,FaGooglePlus,FaLinkedin,FaTwitter} from "react-icons/fa";
import {FacebookIcon,FacebookShareButton,LinkedinIcon,LinkedinShareButton,TwitterIcon,TwitterShareButton} from 'react-share'

const ShareEvent = (allowLoginType,title) =>{

    if(!allowLoginType)return (<span></span>)

    
    const divStyle = {
        fontSize: "18px",
        color:"Tomato"
      };

    let shareUi = []
    const share = ["FACEBOOK","TWITTER","LINKEDIN"]
    const shareUrl = location.href

    const facebookShare = <a href="#"><FacebookShareButton url={shareUrl} quote={title}> <FacebookIcon round={true}  size={24}  /> </FacebookShareButton></a> 
    const linkedInShare = <a href="#"><LinkedinShareButton  url={shareUrl} > <LinkedinIcon round={true}  size={24} /> </LinkedinShareButton> </a>
    const twitterShare = <a href="#"><TwitterShareButton url={shareUrl} > <TwitterIcon round={true}  size={24} /> </TwitterShareButton> </a>

    share.map((socialMedia) => {
        if(allowLoginType.search(socialMedia) >= 0) 
            var icon:any = <span />
            if(socialMedia=="TWITTER") icon = twitterShare
            if(socialMedia=="FACEBOOK") icon = facebookShare
            if(socialMedia=="LINKEDIN") icon = linkedInShare
            shareUi.push(
                <li key={socialMedia}>
                    <span style={divStyle}>
                        {icon}
                    </span>
                </li>
            ) 
    })

    return shareUi
}

type SocialShare ={
    allowLoginType:string,
    title:string
}

const SocialShare = (props:SocialShare) =>{
    const textColor = {color: "#000"};
    const shareUi = ShareEvent(props.allowLoginType,props.title)
    return(
        <div className="submission-share">
            <div className="row share-submission-container">
                <div className="col s12 alignment-share-box center">
                    <h6 className="share-event" style={textColor}>Share This Submission</h6>                    
                </div>
                <div className="col s12 center alignment-share-box">
                    <ul className=" share-icon-list">{shareUi}</ul>
                </div>
            </div>
        </div>    
    )
}

export default SocialShare