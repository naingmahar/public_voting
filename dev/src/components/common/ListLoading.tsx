import * as  React from 'react'

import { WaveSpinner     } from "react-spinners-kit";
class ListLoader extends React.Component<any>{ 
    state = {
        lodaingText:"",
        loading:true,
        intervalId:"",
    }

    render(){
        if(this.props.load){
            return (
                <div className="container">
                    <div className="list-loader">
                        <WaveSpinner  size={60} color={"grey"} loading={this.state.loading} />
                    </div>
                </div>
            )
        }
        return(
            <div></div> 
        )
    }

}


  export default ListLoader
  