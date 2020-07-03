import React from 'react'

const BannerTitle = (props) =>{
    const {title,text_color,show} = props 
    
    if(!show || show == "0" ) return (<span></span>) 
    if(!title)return (<span></span>)
    const textColor = {color: text_color || "#fff"};
    return(<h4 className="banner-title banner-block" style={textColor}>{title}</h4>)
}

export default BannerTitle