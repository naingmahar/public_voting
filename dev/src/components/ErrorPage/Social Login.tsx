import * as React from 'react'
import { FaCheckCircle } from 'react-icons/fa'

export const SocialLogin = () =>{
    return (<div id="loader" style={{backgroundColor:"white",color:"grey"}}>
                <div className="row">
                    <div className="col s6 center-align middle-box">
                        <FaCheckCircle color={"green"} size="100"/>  
                    </div>
                    <div className="col s6 left-align">
                        <h2 color="#fff">OK</h2>
                    </div>
                    <div className="col s12 center-align">
                        <h4>Social Login Success</h4>
                    </div>
                </div>
            </div>)
}