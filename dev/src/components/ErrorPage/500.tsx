import * as React from 'react'
import { FaExclamationCircle } from 'react-icons/fa'
import { errorType } from '../common/common.types'

export const ServerError = (payload:errorType) =>{
    return (<div id="loader" style={{backgroundColor:"white",color:"grey"}}>
                <div className="row">
                    <div className="col s6 center-align middle-box">
                        <FaExclamationCircle color={"grey"} size="100"/>  
                    </div>
                    <div className="col s6 left-align">
                        <h2 color="#fff">{payload.status}</h2>
                    </div>
                    <div className="col s12 center-align">
                        <h4>{payload.message||"Please retry again"}</h4>
                    </div>
                </div>
            </div>)
}