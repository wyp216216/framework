import { tableHeader,search,virtualData } from './Constant'

let $Lib,parameter

//     "pageSize": 10,
//     "pageNo": 1,
//     "data": {
//         "procName": "文件审批-立项",
//         "progStageName": "立项",
//         "progStageId": "817",
//         "procTypeId": "2",
//         "procTypeName": "文件审批",
//         "available": "1",
//         "finaTypeId": "15",
//         "finaTypeName": "小公募",
//         "projectId": "140"
//     },
//     "projectId": 140,
let Interface = {
    approval:{
        url:'/info/service/selectProcessTypeAll',
        success:function(res){
            if(res.code === 0){
                // this.search.forEach(item=>{
                //     if(item.key === 'procTypeId'){
                //         console.log(this,this.message,this.message.procTypeId,'____this')
                //         item.children.splice(1)
                //         res.data.forEach(resItem=>{
                //             if(this.projectId && resItem.id !== 1){
                //                 item.children.push(Object.assign(resItem,{
                //                     procTypeId:resItem.procTypeName
                //                 }))
                //             }else if(!this.projectId){
                //                 if(this.message.procTypeId !== 1 && resItem.id !== 1){
                //                     item.children.push(Object.assign(resItem,{
                //                         procTypeId:resItem.procTypeName
                //                     }))
                //                 }else if(this.message.procTypeId === 1){
                //                     item.children.push(Object.assign(resItem,{
                //                         procTypeId:resItem.procTypeName
                //                     }))
                //                 }else if(!this.message.procTypeId && this.message.finaTypeId === ""){
                //                     item.children.push(Object.assign(resItem,{
                //                         procTypeId:resItem.procTypeName
                //                     }))
                //                 }
                //             }
                //         })
                //     }
                // })
                // this.search.find(item=>item.key === 'progStageName').concat(res.data)
            }
        }
    },
    // 没选项目查询项目阶段
    phase:{
        url:'/info/project/getProjectStageList',
        success:function(res){
            this.search.forEach(item=>{
                if(item.key === 'procTagId'){
                    item.children.splice(1)
                    res.data.forEach(resItem=>{
                        item.children.push(Object.assign(resItem,{procTagId:resItem.name}))
                    })
                }
            })
            console.log(this.search)
        }
    },
    // 选择项目查询项目阶段
    projectPhase:{
        url:'/info/project/getImplementStageList',
        success:function(res){
            // console.log(res,'_____getImplementStageList_____________')
            this.search.forEach(item=>{
                if(item.key === 'procTagId'){
                    item.children.splice(1)
                    res.data.forEach(resItem=>{
                        // console.log(resItem,'____________resItem')
                        item.children.push(Object.assign(resItem,{procTagId:resItem.name,id:resItem.copySourceStageId}))
                    })
                }
            })
        }
    },
    // 流程列表接口
    list:{
        url:'/info/service/findProcessAll',
        success:function(res){
            this.storage = res.data.list
            this.totals = res.data.total
        }
    }
    // / 流程列表接口
    // list:{
    //     url:'/info/service/findProcessAll',
    //     success:function(res){
    //         this.storage = res.data.list
    //         this.totals = res.data.total
    //     }
    // }
}
class Process{
    constructor(argument={}){
        if(typeof argument !== 'object' || Array.isArray(argument)){
            throw new Error(`${argument}不为对象！`)
        }
        console.log(argument.pageSize,'_____argument.pageSize')
        this.resetNULL([argument])
        this.action = argument ? argument : {}
        this.totals = 0 // 查询数据总条数
        this.pageSize = argument.pageSize || 10 // 当前每页的条数
        this.pageNo = 1 
        this.projectId = argument.projectId
        this.storage = virtualData
        console.log(argument,'____this.message')
        this.message = argument || {}
        // 表格抬头
        this.tableHeader = tableHeader
        // 查询搜索栏
        this.search = search
        // 目录审批，目录修订审批，阶段审批
        this.limits = {}
        let object = Object.assign({
            "procName": "",
            "progStageName": "",
            "progStageId": "",
            "procTypeId": "",
            "procTypeName": "",
            "available": "",
            "finaTypeId": "",
            "finaTypeName": "",
            "projectId": ""
        },argument)
        parameter = Object.assign({ 
            "pageSize": this.pageSize,
            "pageNo": this.pageNo,
        },{data:object})
        console.log(parameter,argument,'______1111111')
    }

    // 页码计算
    pageTotals(){
        if(this.projectId !== ''){
            return Math.ceil(this.storage.length/this.pageSize)
        }else{
            return this.totals
        }
    }

    // 翻页计算
    pageFile(filter){
        let arr = filter ? this.storage.filter(item=>{
            let num = 0
            for(let i in filter){
                if(filter[i] !== ""){
                    if(i === 'available' && filter[i] !== "R222" && item[i].toString() !== filter[i].toString() ){
                        num++
                    }else if(i === 'procName' && filter[i] !== "R222" && !(item[i].includes(filter[i]))){ 
                        num++
                    }else if( i !== 'procName' && filter[i] && filter[i] !== "R222" && filter[i] !== '' && item[i] && item[i].toString() !== filter[i].toString()){
                        num++
                    }else if(item[i] === null && filter[i] !== null && filter[i] !== "R222" ){
                        num++
                    }
                }
            }
            if(num === 0){
                return item
            }
        }) : this.storage
        console.log(arr)
        let index = this.pageNo-1 === 0 ? 0 : ((this.pageNo-1)*this.pageSize)
        this.selectLength = arr.length
        return arr.slice(index,index+this.pageSize)
    }

    async init(params={},listParams={},FUNC){
        Object.assign(parameter.data,listParams)
        this.resetNULL([parameter.data])
        if(parameter.data && parameter.data.projectId && parameter.data.projectId !== ''){
            this.projectId = parameter.data.projectId
            Object.assign(parameter,{projectId:parameter.data.projectId})
        }

        if(params.storage){
            this.storage = []
            params.storage.forEach(res=>{
                this.storage.push(this.filter(res))
            })
        }
        
        await this.asyncRequest(Interface.approval,{})
        await this.asyncRequest(Interface.list,Object.assign(parameter,{
            "pageSize": this.pageSize,
            "pageNo": this.pageNo,
        }))
        if(typeof FUNC === 'function'){
            await FUNC()
        }
    }

    async projectPhase(int){ 
        console.log(this.projectId,'__________this.projectId')
        await this.asyncRequest(this.projectId && this.projectId !== '' ? Interface.projectPhase : Interface.phase,{
            data:{
                [this.projectId ? "projectId" : "financingId"]:this.projectId ? this.projectId : int
            }
        })
    }

    resetNULL(arr){
        arr.forEach(res=>{
            let reset = ['procTypeId','procTagId','available','finaTypeId']
            let code = ['R000','R111','R222','R333','R444','R555','R666','R777','R888','R999']
            for(let i in res){
                if(reset.indexOf(i) !== -1 ){
                    if(code.indexOf(res[i]) !== -1){
                        Object.assign(res,{
                            [i]:''
                        })
                    }
                }
            }
        })
    }
    query(object={},dir){
        this.queryParams = Object.keys(object).length > 0 ? object : this.queryParams ? this.queryParams : object
        let obj = this.queryParams
        let arr = [obj,parameter.data]
        this.resetNULL(arr)
        // let params = Object.assign({},object && object.procTypeName && object.procTypeName.toString() === '1' ? {} : parameter.data,{
        //     procName: obj.procName || parameter.data.procName || '', // 审批流程名称
        //     progStageId: obj.procStageName || parameter.data.progStageId || '', // 审批类型
        //     procTypeId: obj.procTypeId || parameter.data.procTypeId || '', // 项目阶段
        //     available:obj.available || parameter.data.available || '', // 是否可用
        // })
        let singleProcType = obj.procTypeId ? true : false
        console.log(obj,'___________obj', singleProcType)
        let params = Object.assign({},object && object.procTypeName && object.procTypeName.toString() === '1' ? {} : parameter.data,{
            procName: obj.procName || '', // 审批流程名称
            progStageId: obj.procTagId || '', // 项目阶段
            procTypeId: obj.procTypeId || '', // 审批类型
            available:obj.available || '', // 是否可用
            singleProcType: singleProcType
        })
        this.asyncRequest(Interface.list,
            Object.assign({data:params},{
                "pageSize": this.pageSize,
                "pageNo": dir === 'select' ? 1 : this.pageNo,
            }))
        return this
    }
    
    
    // 是否可用
    filter(obj){
        console.log(obj, 'available')
        obj.available = obj.available === '0' ? '可用' : obj.available == '1' ? '不可用' : '-'
        return obj
    }


    // 审批类型
    

    
    
    /**
     * 流程模块请求方法
     * @param {*} params 接口请求所需的参数
     * @param {*} success 接口请求成功后执行的方法
     * @param {*} error 接口请求失败后所执行的方法
     * @returns 抛出axios请求实例
     * @memberof Process
     */
    request(message,params,error){
        let successFunc = message.success ? (res)=>{
            message.success.call(this,res)
        } : (res)=>{
            this.storage = res.data
        }
        return $Lib.post(message.url,params,successFunc,error)
    }

    async asyncRequest(message,params,error){
        let successFunc = message.success ? (res)=>{
            message.success.call(this,res)
        } : (res)=>{
            this.storage = res.data
        }
        return await $Lib.asyncPost(message.url,params,successFunc,error)
    }

    hint(scope){
        if(scope.name !== 'hahahah'){
            return {hint:'这是个错误提示！',code:true}
        }else{
            return {hint:'这是个正确提示！',code:true}
        }
    }
}

let Instance = (argument,lib)=>{
    $Lib = lib
    return new Process(argument)
}

export default Instance