import * as React from 'react';
import * as $ from 'jquery'
import Select from 'react-select'
import { CategoriesConvertModel } from '../../Model/categories.model'
import { filterCallBackType } from '../common/common.types';
import { valueContainerCSS } from 'react-select/src/components/containers';
type propsType  = {
    categories : Array<CategoriesConvertModel>,
    callBack ?: Function,
    filter ?: filterCallBackType
} 
class Filter extends React.Component<propsType,filterCallBackType>{ 

    state = {
        search:"",
        sort:"",
        category:"",
        uuid:"",
        categoryOpen:false,
        sortOpen:false
    }

    UNSAFE_componentWillReceiveProps(){
        this.setState({category:this.props.filter.category})
    }

    get uuidGenerate(){
        return `${this.state.search}${this.state.sort}${this.state.category}`
    }

    _handleKeyDown = (e:React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            const search = $(".filter-search").val()
            this.setState({search,uuid:this.uuidGenerate},() =>{
                this.props.callBack(this.state)
            })
        }
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

        
    render(){
        let deafultCategory = [{ value: '', label: 'Search By Category' }]
        let optionsCategory:Array<CategoriesConvertModel> = [...deafultCategory,...this.props.categories]
        const optionsSort = [
            { value: '', label: 'Sort By' },
            { value: 'title', label: 'Title' },
            { value: 'latest', label: 'Latest Submission' },
            { value: 'popular', label: 'Most Popular' }
          ] 


        window.addEventListener("scroll",(event)=>{
            const Yaxis = window.scrollY
            if(Yaxis >= 318) {
                $("#filter").addClass("filter-bar-fixed")
                // $("#filter .row").addClass("z-depth-1")
            }
            else if(Yaxis <= 318) {
                $("#filter").removeClass("filter-bar-fixed")
                // $("#filter .row").removeClass("z-depth-1")
            }
        },false)

        return (
                <div id="filter">
                    <div className="row z-depth-1">
                        <div className="col s2 offset-s2">
                            <Select
                                id="select-category"
                                isSearchable={false}
                                // menuIsOpen={this.state.categoryOpen}
                                value={optionsCategory.filter(({value}) => value === this.state.category)}
                                onChange={selectedValue => this.onCategoryChangeFunc(selectedValue)} 
                                options={optionsCategory} 
                                placeholder="Search By Category"  />
                        </div>
                        <div className="col s2 offset-s1">
                            <Select 
                                id="select-sort"
                                // menuIsOpen={this.state.sortOpen}
                                isSearchable={false}
                                value={optionsSort.filter(({value}) => value === this.state.sort)} 
                                onChange={selectedValue => this.onSortChangeFunc(selectedValue)} 
                                options={optionsSort} 
                                placeholder="Sort By"  />
                        </div>
                        <div className="input-field col s2 offset-s1">
                            <i className="material-icons prefix">search</i>
                            <input 
                                type="text" 
                                // onChange={e => this._handleOnCahnge(e)} 
                                onKeyDown={e => this._handleKeyDown(e)} 
                                className="filter-search" 
                                placeholder="Search" />
                        </div>
                    </div>
                </div>
        )
    }

}



  export default Filter
  
