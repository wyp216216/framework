import Manage from '../Manage'
import Port from '../Port'


/**
 * 主实例属性，方法绑定 
 **/
export default {
    code:'api/',
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
    },

    // 接口请求
    axios:(params,methods,...data)=>{
        return new Port(params,methods,$More.code,...data)
    },
    // 模块引用
    ref(key,...params){
        let model = Manage.read(key,...params)
        $More.bind(model)
        return model
    },
    // 模块重置化
    res(key){
        return Manage.read(key)
    }
}