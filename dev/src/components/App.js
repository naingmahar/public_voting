import React from 'react';
import Header from './header/Header'
import 'babel-polyfill';
import {BrowserRouter,Route } from 'react-router-dom'
import 'materialize-css/dist/js/materialize'
import 'materialize-css/dist/css/materialize.css'
import '../../style/style.css'
import "react-responsive-carousel/lib/styles/carousel.min.css"
import About from './about'
import ListView from './Votings/VotingList'
import Loader from './loader'
import Footer from './footer'
import Details from './details/VotingDetails'
import DialogBox from './common/AlertBox'
import $ from 'jquery'
import MobileFilter from './Votings/MobileFilter'
import {Helmet} from "react-helmet";

const {ErrorBox,LogoutConfirmBox} = DialogBox

export default class App extends React.Component {
 
  state ={
    loading: 1,
    url:"",
    staticurl:""
  }

  UNSAFE_componentWillMount (){
    let url = window.location.href 
    console.log("URL",url)
    url =url.replace("http://","")
    url =url.replace("https://","")
    let splitUrl = url.split('/')

    if(splitUrl[splitUrl.length -1] == "about"  ){
      splitUrl.length = splitUrl.length -1
    } 

    if(splitUrl[splitUrl.length -2] == "submissions"  ){
      splitUrl.length = splitUrl.length -2
    } 

    let urlIndex = splitUrl.length >= 3 ? 2 : 1

    if(splitUrl.length >= 3 ){
      console.log("worng Route",splitUrl)
      this.setState({url:splitUrl[urlIndex]})
      this.setState({staticurl:splitUrl[urlIndex-1]})
    }

    if(splitUrl.length < 3 ){
      this.setState({url:splitUrl[urlIndex]})
    }
  }

  disibleLoader= () =>{
    this.setState({loading:0})
  }

  componentDidMount(){
    M.AutoInit();
  }

  generateRouter=()=>{
    var devRoute = (
      <div>
        <Route path="/:pathParam1" component={ListView} exact/>
        <Route path="/:pathParam1/about" component={About} />
        <Route path="/:pathParam1/submissions/:submission" component={Details} />
      </div>
    )

    var prodRoute = (
      <div>
        <Route path="/:pathParam1/:pathParam2" component={ListView} exact/>
        <Route path="/:pathParam1/:pathParam2/about"  component={About}/>
        <Route path="/:pathParam1/:pathParam2/submissions/:submission" component={Details} />
      </div>
    )
    if(process.env.NODE_ENV === 'production') return prodRoute
    return devRoute
  }

  render() {
    if(this.state.loading) return <Loader url={this.state.url} staticurl={this.state.staticurl} disibleLoader={this.disibleLoader} />

    // $(document).ready(function() {
    //   $("head").prepend('');
    //   $("head").prepend('');
    // });

    return (
      <BrowserRouter>
        <Helmet>
          <meta property="og:title" content="Public Voting"></meta>
          <meta property="og:image" content="https://s3-ap-southeast-1.amazonaws.com/uploads.judgify.me/uploads/24702/12df53fea8b3adfa6c2ec456dd22e204_1531195861235.jpg"></meta>
        </Helmet>
          <div className="App" id={this.state.url}>
            <Header url={this.state.url} staticurl={this.state.staticurl} />
            <ErrorBox />
            <LogoutConfirmBox />
              {this.generateRouter()}
              {/* <Route path="*" component={ListView} exact/> */}
            <Footer />
          </div>
      </BrowserRouter>
    );
  }
}