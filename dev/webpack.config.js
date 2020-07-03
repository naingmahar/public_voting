const development = require('./webpackConfig/dev.webpack.config')
const production = require('./webpackConfig/prod.webpack.config')
const fs = require('fs')
var rimraf = require("rimraf");

async function distFileWatch(){
  rimraf.sync("./dist")
  rimraf.sync("../webroot/")
  const intervalId = setInterval(async function(){
    let distJsDir =[]
    let distFontDir = []
    try {
      distJsDir = await fs.readdirSync("./dist/")
      distFontDir = await fs.readdirSync("./dist/fonts/") 
    } catch (error) {
      console.log("Trying");
    }

    if(distJsDir && distJsDir[0] && distJsDir.length){
      await fs.mkdirSync("../webroot")
      await fs.mkdirSync("../webroot/js")
      distJsDir.map(async (file)=>{
        await fs.createReadStream("./dist/"+file).pipe(fs.createWriteStream("../webroot/js/"+file));
      })
      distFontDir.map(async (file)=>{
        await fs.createReadStream("./dist/fonts/"+file).pipe(fs.createWriteStream("../webroot/"+file));
      })
      console.log("Success build");
      
      clearInterval(intervalId)
    }
  },15000)
}

function config(){
  if(process.env.npm_lifecycle_event=="build") {
    distFileWatch()
    return production
  }
  return development
}

module.exports = config()
