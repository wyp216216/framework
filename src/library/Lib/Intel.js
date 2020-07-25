let Lib
class Intel{
    constructor(){
        this.list=[]
    }
    static getInstance(){
        if(!this.Instance){
            this.Instance = new Intel()
        }
        return this.Instance
    }
    /**
     * 智能核查使用方法
     * 调用方式：this.$Intel.message(res)
     * @param {*} [res=[]] res参数为数组包裹对象，对象参数分别为{id:文件id,name:文件名称,size:文件大小，type：文件类型}
     * @returns
     * @memberof Intel
     */
    message(res=[]){
        if(!Array.isArray(res)){
            throw new Error(`${res} is not Array!`)
        }
        let format = { size:Number,id:String,name:String,type:String }
        res.forEach(item=>{
            console.log(item)
            for(let i in format){
                
            }
            if(typeof item.size !== 'number'){
                throw new Error('size is not number')
            }
        })
        this.list = res
        return this
    }
}

let port = (res)=>{
    Lib = res
    return Intel.getInstance()
}
export default port