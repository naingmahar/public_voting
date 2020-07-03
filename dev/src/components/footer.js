import React from 'react'
import {Link,NavLink} from 'react-router-dom'
import { Route } from 'react-router-dom'

const Footer = () =>{
    return(
        <div className="footer-copyright">
            <div className="container ">
                <div className="col s12 center-align">
                    <p>POWERED BY: </p>
                </div>
                <div className="col s12 center-align">
                    <a href="https://www.judgify.me/">
                        <img src="https://www.judgify.me/img/logo.png" 
                            alt="judgify" 
                            title="judgify" />
                    </a>
                </div>
            </div>
        </div>            
    )
}

export default Footer