import * as React from 'react';
import Slider from "react-slick";
import {FaPlayCircle} from "react-icons/fa"; 
import { SliderProps, contentType, imageVideoTemplateParamType, RawObject } from '../../common/common.types';
import { typeCheck, ImageHandler } from '../../common/commont.function';
import {Carousel} from 'react-responsive-carousel'

class SimpleSlider extends React.Component<SliderProps> {

  state={images:[],index:0}

  componentDidMount(){
    ImageHandler(this.props.data_array,this.props.openVideoImageDialog,"","")
     .then(images=>this.setState({images}))
     .catch(error => console.error(error))
 }


  render() {
    return (
      <div style={{color:"red",padding:"30px"}}>
        <Carousel 
          showArrows={true} showIndicators={false} 
          showStatus={this.state.images.length > 1 ? true : false}
          onClickItem={(index)=>this.props.openVideoImageDialog(index)} 
          >
            {this.state.images}
        </Carousel>
      </div>
    );
  }
}

export default SimpleSlider