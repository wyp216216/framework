import Single from './Main/More'

import Common from './Lib//Common'
import Examine from './Lib/Examine'
import Business from './Lib/Business'
import Intel from './Lib/Intel'
import Mit from './Lib/Mit'

// 组件引入
import examine from '@/components/examine/examine'
import BusinessTree from '@/components/business/BusinessTree'
import BusinessProcess from '@/components/business/BusinessProcess'

// 数据管理
const components = [
    BusinessTree,BusinessProcess,examine
]

export default {
    install(Vue,option){
        this.a = 2
        this.b = 3
        this.$lib = Common(option)
        Vue.prototype.$Business = Business(this.$lib)
        Vue.prototype.$Examine = Examine(this.$lib)
        Vue.prototype.$Intel = Intel(this.$lib)
        Vue.prototype.$Mit = Mit
        components.forEach(component=>{
            Vue.component(component.name,component)
        })

        // 模块对象入口初始化
        Object.assign($More,Single)

        // // 模块级声明
        // let a = $More.axios({                                   // 接口模块实例化
        //     name:'flow',                                        // 接口模块名称
        //     data:{ name:'这是个模块' },                          // 接口模块默认参数
        //     methods:(res)=>{                                    // 接口模块默认回调
        //         console.log(res,'____我是模块函数')
        //         return res.data.data
        //     }
        // })
        
        // // 接口块声明
        // a.scope('before:flow',{                                 // 接口块声明
        //     name:[ 'GetAllFinanceType', 'Postname2'],           // 接口块声明接口区间
        //     data:{ age:'24' },                                  // 接口块声明默认参数
        //     custom:(res)=>{                                     // 接口块声明钩子函数
        //         console.log(res,'____我是块级方法')
        //         return res
        //     }
        // })

        // // 私有化方法声明
        // a.use('GetAllFinanceType',{                             // 接口调用
        //     data:{custom:'自定义属性',num:()=>this.a+this.b},                          // 接口参数
        //     custom:(res)=>{                                     // 接口回调
        //         console.log(this,'___this指向')
        //         return res
        //     }
        // })

        // // 数组序列调用
        // a.use([                                                 // 同步序列化回调
        //     {
        //         name:'GetAllFinanceType',                       // 序列化回调名称
        //         data:{custom:'自定义属性'},                      // 序列化回调参数
        //         custom:(res)=>{                                 // 序列化回调函数
        //             console.log(this,'___this指向')
        //             return res
        //         }
        //     },
        //     {
        //         name:'GetAllFinanceType',
        //         data:{custom:'第二份数据'},
        //         custom:(res)=>{
        //             console.time()
        //             this.red = res
        //             console.timeEnd()
        //             console.log(this,'___this指向第第二级别')
        //             return res
        //         }
        //     },
        //     {
        //         name:'GetAllFinanceType',
        //         data:{
        //             custom:()=>this.red                         // 函数式传参
        //         },
        //         custom:(res)=>{
        //             console.log(this,this.red,'___this指向')
        //             return res
        //         }
        //     }
        // ])


        // let add = (res)=>{
        //     this.num = this.num ? this.num+res : res
        //     return add
        // }

        // add.toString = ()=>{
        //     return this.num
        // }
        // console.log(add(1)(2)(3),'_______this.num')
    }
}