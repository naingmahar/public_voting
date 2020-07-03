export const Categories = (apiResponse:Array<CategoriesOriginalModel>):Array<CategoriesConvertModel> =>{
    const tempArray:Array<CategoriesConvertModel> = []
    apiResponse.map(data=>{
        tempArray.push({
            label:data.value,
            value:data.value
        })
    })
    return tempArray
}

export type CategoriesOriginalModel = {
    value:string|number,
    event_category_id:string|number
}

export type CategoriesConvertModel = {
    value:string|number,
    label:string|number,
}