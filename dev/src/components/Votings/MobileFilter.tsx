import * as React from 'react';
import * as $ from 'jquery'
import Select from 'react-select'
import { CategoriesConvertModel } from '../../Model/categories.model'
import { filterCallBackType } from '../common/common.types';
import {FaSortAmountDown,FaChevronUp} from 'react-icons/fa'
type propsType  = {
    categories : Array<CategoriesConvertModel>,
    callBack ?: Function,
    filter ?: filterCallBackType
} 
class MobileFilter extends React.Component<propsType,filterCallBackType>{ 

    state = {
        search:"",
        sort:"",
        category:"",
        uuid:"",
    }

    UNSAFE_componentWillReceiveProps(){
        this.setState({category:this.props.filter.category})
    }

    get uuidGenerate(){
        return `${this.state.search}${this.state.sort}${this.state.category}`
    }
    _handleOnCahnge = (e:React.ChangeEvent) => {
        const search = $("#filter-search").val()
        this.setState({search,uuid:this.uuidGenerate})
    }
    _handleKeyDown = (e:React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            const search = $("#filter-search").val()
            this.setState({search,uuid:this.uuidGenerate},() =>{
                this.props.callBack(this.state)
            })
        }
    }
    _handleFilterButton = (e) =>{
        $(".filterOption").toggle()
        e.preventDefault()
    }

    onCategoryChangeFunc(optionSelected) {
        const value = optionSelected.value;
        this.setState({category:value,uuid:this.uuidGenerate},()=>{
            this.props.callBack(this.state)
        })
    }

    onSortChangeFunc(optionSelected) {
        const value = optionSelected.value;
        this.setState({sort:value,uuid:this.uuidGenerate},()=>{
            this.props.callBack(this.state)
        })
    }
   
    optionsSort = [
        { value: '', label: 'Sort By' },
        { value: 'title', label: 'Title' },
        { value: 'latest', label: 'Latest Submission' },
        { value: 'popular', label: 'Most Popular' }
    ]
    
    deafultCategory = [{ value: '', label: 'Search By Category' }]

    render(){
    
        let optionsCategory:Array<CategoriesConvertModel> = [...this.deafultCategory,...this.props.categories]

        return (
                <div id="mobile-filter" className="filter-bar-fixed">
                    <div className="row z-depth-1">
                        <div className="input-field col s8 offset-s1">
                            <i className="material-icons prefix small">search</i>
                            <input 
                                type="text" 
                                onChange={e => this._handleOnCahnge(e)} 
                                onKeyDown={e => this._handleKeyDown(e)} 
                                className="validate" 
                                placeholder="Search" />
                            <a href="#" onClick={this._handleFilterButton}><i className="material-icons prefix" style={{paddingLeft:"30px"}}>filter_list</i></a>
                        </div>

                        <div className="col s8 offset-s2 filterOption" style={{display:"none"}} >
                            <Select 
                                isSearchable={false}
                                value={optionsCategory.filter(({value}) => value === this.state.category)}
                                onChange={selectedValue => this.onCategoryChangeFunc(selectedValue)} 
                                options={optionsCategory} 
                                placeholder="Search By Category"  />
                        </div>


                        <div className="col s8 offset-s2 filterOption" style={{display:"none"}} >
                            <Select 
                                isSearchable={false}
                                value={this.optionsSort.filter(({value}) => value === this.state.sort)} 
                                onChange={selectedValue => this.onSortChangeFunc(selectedValue)} 
                                options={this.optionsSort} 
                                placeholder="Sort By"  />
                        </div>

                    </div>
                </div>
        )
    }

}



  export default MobileFilter
  
