const dev ={ 
    URL:"http://localhost.jud.me/public-voting",
    FACEBOOK:"388224075203337",
    LINKEDIN:"753zwr3365krz2",
    TWITTER:"TwbudV5jstiIEAFCPUEuiPsf4",
    GOOGLE:"366605422766-8va6gqq4p3fcl9e8kk3cbv56rqcguft6.apps.googleusercontent.com",
    REDIRECT_URL:"https://"+location.host+"/public-voting/social_login"
}

const cloudDev ={ 
    URL:"https://dev.judgify.me/public-voting",
    FACEBOOK:"388224075203337",
    LINKEDIN:"753zwr3365krz2",
    TWITTER:"TwbudV5jstiIEAFCPUEuiPsf4",
    GOOGLE:"366605422766-8va6gqq4p3fcl9e8kk3cbv56rqcguft6.apps.googleusercontent.com",
    REDIRECT_URL:"https://"+location.host+"/public-voting/social_login"
}

const prod ={
    URL:"https://www.judgify.me/public-voting",
    FACEBOOK:"437391403135284",
    TWITTER:"5zeZP1dy6hIYqeIuz70f63hA0",
    LINKEDIN:"753zwr3365krz2",
    GOOGLE:"366605422766-8va6gqq4p3fcl9e8kk3cbv56rqcguft6.apps.googleusercontent.com",
    REDIRECT_URL:"https://"+location.host+"/public-voting/social_login"
}


const staging ={
    URL:"https://www.judgify.me/public-voting",
    FACEBOOK:"437391403135284",
    TWITTER:"5zeZP1dy6hIYqeIuz70f63hA0",
    LINKEDIN:"753zwr3365krz2",
    GOOGLE:"366605422766-8va6gqq4p3fcl9e8kk3cbv56rqcguft6.apps.googleusercontent.com",
    REDIRECT_URL:"https://"+location.host+"/public-voting/social_login"
}

function config(){
    const url = window.location.href
    const server = url.split('/')[2]
    let responseModel = model
    if(server.search("dev") != -1) responseModel = cloudDev
    else if(server.search("staging") != -1) responseModel = staging
    else if(server.search("localhost") != -1) responseModel = dev
    else console.log = function(){}
    console.log("Server",server) 
    return responseModel
}
const model = {
    URL: prod.URL,
    FACEBOOK:prod.FACEBOOK,
    TWITTER:prod.TWITTER,
    LINKEDIN:prod.LINKEDIN,
    GOOGLE:prod.GOOGLE,
    REDIRECT_URL:prod.REDIRECT_URL
}

export {config}


