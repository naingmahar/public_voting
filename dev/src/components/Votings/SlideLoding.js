import React,{Component} from 'react'
import { RotateSpinner } from "react-spinners-kit";
class SlideLoader extends Component{ 
    state = {
        lodaingText:"",
        loading:true,
        intervalId:"",
    }

    componentDidMount(){
        const intervalId = setInterval(()=>{
            this.setState({intervalId:intervalId})
            // if(this.props.load == false) {
            //     this.setState({loading:false})
            //     clearInterval(intervalId)
            // }
            let text = "Loading....."
            let currentLoadingTextlength = String(this.state.lodaingText).length
            
            if(currentLoadingTextlength >= text.length)currentLoadingTextlength =0
            currentLoadingTextlength += 1
            
            this.setState({
                lodaingText:text.substring(0,currentLoadingTextlength)
            })

        },300)
    }

    componentWillUnmount(){
        clearInterval(this.state.intervalId)
    }

    render(){
        if(this.props.load){
            return (
                <div id="Slide-Loader" className="row">
                    <div className="col xl6 s12 offset-xl3 valign-wrapper">
                        <div className="col offset-xl4 xl1 offset-s3 s2"><RotateSpinner size={30} color={"dimgray"} loading={this.state.loading} /></div>
                        <div className="col xl7 s7 left-align"><h6>{this.state.lodaingText}</h6></div>
                    </div>       
                </div>
            )
        }
        return(
            <span></span> 
        )
    }

}


  export default SlideLoader
  