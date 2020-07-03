import React from 'react'
import moment from 'moment'

const BannerDate = (props) =>{

    const {show,startDate,endDate,text_color} = props 
    if(!show || show == "0" ) return (<span></span>) 
    if(!startDate && !endDate)return (<span></span>)
    const textColor = {color: text_color || "#fff"};
    return(
            <p className="banner-block banner-date" style={textColor}>
                <span>{convertTimeFormat(startDate)} to {convertTimeFormat(endDate)} </span>
            </p>
        )
}

const convertTimeFormat = (date) =>{
    date = date * 1000
    return moment(new Date(date)).format('LL')
}

export default BannerDate