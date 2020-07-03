import React from 'react'
import {FaFacebook,FaGooglePlus,FaLinkedin,FaTwitter} from "react-icons/fa";
import {FacebookIcon,FacebookShareButton,LinkedinIcon,LinkedinShareButton,TwitterIcon,TwitterShareButton} from 'react-share'
const ShareEvent = (props) =>{
    const {allowLoginType,text_color,shareicon_color,show,title} = props 
    if(!show || show == "0") return (<span></span>) 

    if(!allowLoginType)return (<span></span>)

    const textColor = {color: text_color || "#fff"};
    const divStyle = {
        "fontSize": "18px",
        color: shareicon_color||"Tomato"
      };

    let shareUi = []
    const share = ["FACEBOOK","TWITTER","LINKEDIN"]
    const shareUrl = location.href

    const facebookShare = <a href="#" onClick={(e)=>e.preventDefault()}>
                            <FacebookShareButton url={shareUrl} quote={title}> 
                                <FacebookIcon round={true}  size={32}round /> 
                            </FacebookShareButton>  
                          </a>
    const linkedInShare = <a href="#" onClick={(e)=>e.preventDefault()}>
                                <LinkedinShareButton url={shareUrl} quote={title}> <LinkedinIcon round={true}  size={32}round /> </LinkedinShareButton> 
                          </a>
    const twitterShare = <a href="#" onClick={(e)=>e.preventDefault()}>
                            <TwitterShareButton url={shareUrl} quote={title}> <TwitterIcon round={true}  size={32}round /> </TwitterShareButton> 
                         </a>

    share.map((socialMedia) => {
        if(allowLoginType.search(socialMedia) >= 0) 
            var icon = facebookShare
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


    return(
            <div className="row banner-block share-event-container">
                <div className="col s12 alignment-share-box">
                    <h3 className=" share-event" style={textColor}>SHARE THIS EVENT</h3>                    
                </div>
                <div className="col s12 center alignment-share-box">
                    <ul className=" share-icon-list">{shareUi}</ul>
                </div>
            </div>    
        )
}

export default ShareEvent