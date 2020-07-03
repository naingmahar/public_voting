import * as React from 'react'
import { FaExclamationCircle } from 'react-icons/fa'

export const ErrorPage = ({message}) =>{
    return (<div id="loader" style={{backgroundColor:"white",color:"grey"}}>
                <div className="row">
                    <div className="col xl12 s12 center-align">
                        <span><FaExclamationCircle color={"grey"} size="70"/></span>
                        <h4 color="#fff">{message}</h4>
                    </div>
                    {/* <div className="col s12 center-align">
                        <h4></h4>
                    </div> */}
                </div>
            </div>)
}
