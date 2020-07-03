export type SocalMediaType = "facebook"|"linkedin"|"twitter"|"google"

export type AnonymousType ={
    email: string
    first_name: string
    last_name: string
    referer: string
}

export type AuthType = {
    Authorize:Boolean
    voter_id:String
    AnonymousData:AnonymousType
    event_id: String
    suburl: String
    voting_round_id: String      
}

export type SaveVoterType  = {
    email: String
    first_name: String
    last_name: String
    referer: String
}

export type SocialType = {
    email: String
    first_name: String
    id: String
    last_name: String
    name: String
    picture: String
    thumbnail: String
}

export class SaveVoterModel{
    create = (socalResponse:SocialType,referer:String):SaveVoterType =>{
        return {
            email:socalResponse.email||socalResponse.id,
            first_name:socalResponse.first_name,
            last_name:socalResponse.last_name,
            referer
        }
    }
}

export class AuthModel{
        
    private key = "AUTH"
    
    setAuth(payload:AuthType){
        let data = JSON.stringify(payload)
        localStorage.setItem(this.key,data) 
    }
    
    getAuth():AuthType{
        try {
            let data = localStorage.getItem(this.key)
            return JSON.parse(data)    
        } catch (error) {
            return 
        }
    }

    clearAuth():void{
        localStorage.setItem(this.key,"")
    }

}

