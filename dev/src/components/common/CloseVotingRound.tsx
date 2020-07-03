import * as  React from 'react'
import { FaExclamationTriangle } from 'react-icons/fa'

import { MagicSpinner } from "react-spinners-kit";
class NotFound extends React.Component<any>{ 
    state = {
        lodaingText:"",
        loading:true,
        intervalId:"",
    }

    render(){
        return(
            <div className="container" style={{backgroundColor:"white",color:"grey"}}>
                <div >
                        <div className="list-loader">
                            <FaExclamationTriangle color={"grey"} size="50"/>  
                            <h4 style={{color:"grey"}}>{this.props.message}</h4>
                        </div>
                </div>
            </div> 
        )
    }

}


  export default NotFound
  