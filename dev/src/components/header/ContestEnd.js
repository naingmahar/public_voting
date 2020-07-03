import React from 'react'

class ContestEnd extends React.Component{
    state = {
        props:{},
        left_Day:0,
        left_Hour:0,
        left_Minute:0,
        left_Second:0
    }

    timeCalculation(endDate){
        
        endDate = parseInt(endDate)*1000
        let currentDate = new Date().getTime()
            if(currentDate >= endDate) {
                this.setState({
                    left_Day:0,
                    left_Hour:0,
                    left_Minute:0,
                    left_Second:0
                })
                return 0
            }

            let timeLeft = endDate- currentDate
            let left_day =  timeLeft / 86400000
            let left_hour =  (timeLeft % 86400000) / 3600000
            let left_minute =  ((timeLeft % 86400000) % 3600000) / 60000
            let left_second =  (((timeLeft % 86400000) % 3600000) % 60000) /1000
            this.setState({
                left_Day:Math.floor(left_day),
                left_Hour:Math.floor(left_hour),
                left_Minute:Math.floor(left_minute),
                left_Second:Math.floor(left_second)
            })
            return 1
    }

    componentDidMount(){

        const interval =setInterval(()=>{
            const endDate = this.props.endDate || 0
            //if(endDate) clearInterval(interval);
            const isZero = this.timeCalculation(endDate)
            //if(isZero == 0) clearInterval(interval);
        },1000)
    }

    render(){
        const {text_color,show_time_left} = this.props 
        
        if(!show_time_left || show_time_left == "0" )return (<span></span>)

        const textColor = {color: text_color || "#fff"};

        return(
                <div className="row banner-block content-end-container" style={textColor}>
                    <div className="col s12">
                        <h3 className="contest-ends">CONTEST ENDS</h3>                    
                    </div>
                    <div className="col s12">
                        <div className="row timer-box">
                            <div className="col xl3 s3">
                                <div className="row">
                                    <div className="col s12 num"><h4>{this.state.left_Day}</h4></div>
                                    <div className="col s12 center">Day</div>
                                </div>
                            </div>
                            <div className="col xl3 s3">
                                <div className="row">
                                    <div className="col s12 num"><h4>{this.state.left_Hour}</h4></div>
                                    <div className="col s12 center">Hour</div>
                                </div>
                            </div>
                            <div className="col xl3 s3">
                                <div className="row">
                                    <div className="col s12 num"><h4>{this.state.left_Minute}</h4></div>
                                    <div className="col s12 center">Minute</div>
                                </div>
                            </div>
                            <div className="col xl3 s3">
                                <div className="row">
                                    <div className="col s12 num"><h4>{this.state.left_Second}</h4></div>
                                    <div className="col s12 center">Second</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>    
            )
    }    
}

export default ContestEnd