import React from 'react'
import Card  from './Card'
import { type } from 'os';

class CardList extends React.Component {
    


    render(){
        let ui = []
        const _handleFilterCallBack = (filter) => {
            this.props.filterCallBack(filter)
        }


        for (let index = 0; index < this.props.list.length; index++) {
            ui.push(<Card 
                        key={index} 
                        data={this.props.list[index]} 
                        type={this.props.type} 
                        filterCallBack={_handleFilterCallBack} 
                        votingTypeDetail={this.props.votingTypeDetail}
                    />)
        }
        return(
            <div className="row">
                <div className="col xl10 s12 offset-xl1">{ui}</div>
            </div>
        )
    }
}


export default CardList