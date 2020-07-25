import Manage from '../Store/Manage'
import Store from '../Store/Store'
import Port from '../Port'
const METHODS = {
    // import:()=>{ $More[name.replace('ref') = 'Model'] = $More.bind([Manage][read](key,...params)) )},
    
    // import(name,func){
    //     {
    //         'ref':()=>{$More.Model = $More.bind(Manage.read(key,...params))}
    //     }
    //     $More[name.indexOf('ref') = 'Model'] = $More.bind([Manage][read](key,...params))
    // }
}

/**
 * 主实例属性，方法绑定 
 **/
export default {
    // 实例绑定
    bind:(instance)=>{
        Object.assign(instance,{
            confine(name,...params){
                if(this.CONFINE && this.CONFINE[name]){
                    return this.CONFINE[name].call(this,...params)
                }
                throw new Error(`不存在该约定`)
            }
        })
        return instance
    },

    // 接口请求
    axios:(params,methods,...data)=>{
        return new Port(params,methods,...data)
    },
    // 模块引用
    ref(key,...params){
        $More.Model = $More.bind(Manage.read(key,...params))
        return $More.Model
    },
    // 模块重置化
    refReset(key,...params){
        $More.Model = $More.bind(Manage.reset(key,...params))
        return $More.Model
    },
    // 状态模块引用
    status(key,...params){
        $More.Work = $More.bind(Store.read(key,...params))
        return $More.Work
    },

    // 状态模块重置化引用
    statusReset(key,...params){
        $More.Work = $More.bind(Store.reset(key,...params))
        return $More.Work
    },
    /**
     * 对象解构赋值
     * @param {*} main 主对象
     * @param {*} arr 复制键集群
     * @param {*} object 复制源
     * @returns
     */
    copy(main,arr,object){
        let func = {
            string(res){
                if(object[res]){
                    main[res] = object[res] 
                    return false
                }
                return true
            },
            object(res){
                for(let i in res){
                    if(typeof res[i] === 'function'){
                        main[i] = res[i](object)
                    }else{
                        return true
                    }
                }
                return false
            }
        }
        let nothing = arr.filter(res=>{
            let item = func[typeof res](res)
            return item.length > 0 
        })
        return nothing
    },
    /**
     * 将对象转换为字符串
     * @param {*} obj 对象toString方法 
     */
    toString(obj){
        let str = ``
        for(let i in obj){ 
            str += `${i}:${obj[i].toString()}`
        }
        return str
    }
}