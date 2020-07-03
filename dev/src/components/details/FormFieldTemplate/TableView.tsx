import * as React from 'react';
import {FaFacebook,FaGooglePlus,FaLinkedin,FaTwitter} from "react-icons/fa";

type props={
    formField:Object|any
}

class FormTableView extends React.Component<props>{
   
    render(){
        const {formField} = this.props
        // if(!formField || !formField[0]) return []
        
        const keysArray = Object.keys(formField)
        const valueArray = Object.values(formField)
        let ui = []
    
        keysArray.forEach((value,index)=>{

            let val = valueArray[index].toString();
            ui.push(
                <div className="row" key={index}>
                    <div className="col s3"><b>{value}:</b></div>
                    <div className="col s9" dangerouslySetInnerHTML={{ __html: val }}></div>
                </div>   
            )
        })
        return ui
    }
}


export default FormTableView