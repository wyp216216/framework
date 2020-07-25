import Module from './Register'

class ParamsMit{
    constructor(){

    }
    static GetInstance(){
        if(!this.Instance){
            this.Instance = new ParamsMit()
            for(let i in Module){
                if(typeof Module[i] === 'object' && !Array.isArray(Module[i])){
                    this.Instance.register(i,module[i])
                }else{
                    this.Instance.register(i)
                }
            }
        }
        return this.Instance
    }
    
    /**
     * 
     * 模块注册
     * @param {*} name name为模块的名称，必须为字符串如果非字符串则报错，如果已有注册模块则报错
     * @param {*} obj  obj为模块对象参数对象内字段可为类型也可为具体值
     * 
     */
    
    register(name,obj){
        if(typeof name === 'string'){
            if(this[name]){
                throw new Error(`${name}该模块已注册`)
            }else{
                if(Array.isArray(obj)){
                    this[name] = obj
                }else{
                    this[name] = {}
                    if(typeof obj === 'object'){
                        for(let i in obj){
                            Object.assign(this[name],{
                                [i]:this.filter(obj[i]) ? new obj[i] : obj[i]
                            })
                        }
                    }
                }
            }
        }else{
            throw new Error(`${name}参数应为字符串`)
        }
    }

    get(res){
        if(res && this[res]){
            return this[res]
        }else{
            return undefined
        }
    }

    set(res,type){
        if(res && type){
            let data = this.filter(type)
            this[res] = data ? new type : type
            return this[res]
        }else{
            throw new Error(`${res}数据不存在，若${res}参数不存在，则type参数不得为空`)
        }
    }

    /**
     * 模型参数监听
     * @param {*} res  res为对象详细参数如下
     * {
     *  demo:FUNC(原对象,新对象,设定的key值)，
     *  demo.add:FUNC(旧参数,新参数,设定的key值,原对象)，
     *  对象参数中接受2种传参格式，一种如demo为模块全局监听，另一种为demo.add为监听某个单一字段
     * }
     */

    watch(res){
        let module = []
        let handle = (i,arg)=>{
            if(module.findIndex(item=>arg ==='whole' ? item.name === i : item.name === arg[0]) === -1){
                module.push({name:arg ==='whole' ? i : arg[0],handle:{}})
            }
            let obj = arg ==='whole' ? {whole:res[i]} : {[arg[1]]:res[i]}
            let data = module.find(item=> arg ==='whole' ? item.name === i : item.name === arg[0])
            arg ==='whole' ? Object.assign(data,obj) : Object.assign(data.handle,obj)
        }

        for(let i in res){
            let arr = i.indexOf('.') !== -1 ? i.split('.') : []
            arr.length > 1 ? handle(i,arr) : handle(i,'whole')
        }
        module.forEach(item=>{
            if(!this[item.name]){ this.register(item.name) }
            this[item.name] = new Proxy(this[item.name],{
                set:(target,key,value)=>{
                    if(item.whole){
                        item.whole(target,value,key)
                    }
                    if(item.handle[key]){
                        item.handle[key](target[key],value,key,target)
                        target[key] = value
                    }
                    return this
                }
            })
        })
    }
    

    /**
     * 
     * @param {*} type 过滤参数判断，若是类型则new出来
     */
    filter(type){
        let arr = [String,Object,Array,Number,Boolean]
        if(arr.indexOf(type) !== -1){
            return true
        }else{
            return false
        }
    }
}

let Mit = ()=>{
    return ParamsMit.GetInstance()
}

export default Mit()