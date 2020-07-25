import Process from './Process'

// 局部变量代替私有属性声明
let $Lib,nodeArr
let flat = []

// 树结构数据扁平化
let flatFunc = (arr,index=3,area=[],data={})=>{
    let ind = index;
    arr.forEach((res)=>{
        res.index = ind++
        Object.assign(res,data)
        // Object.assign(res,{index:index++})
        area.push(Object.assign({},res,{children:[]},data))
        if(res.children && res.children.length > 0){
            ind = flatFunc(res.children,ind,area,data).index
        }
    })
    return {index:ind,area:area}
}

// 业务模块请求对象
let examine = {
    // 普通审核接口
    general:{
        // url:'/info/service/selectProcessTypeAll',
        url:'/info/service/getUsableProcessType',
        success:function(res){
            if(res.data.length > 0){
                const addAttri = (node) => {
                    if(!node) return
                    node.forEach(item => {
                        item.isOrdinary = true
                        addAttri(item.children)
                    })
                }
                addAttri(res.data[0].children)
                res.data[0].isOrdinary = true
                flat =flat.concat(flatFunc(res.data,1,[],{
                    dataType:1
                }).area)
                this.type[0].children.splice(0,0,res.data[0])
            }
        }
    },

    // 项目审核接口
    project:{
        url:'/info/project/getUsableFinanceType',
        success:function(res){
            if(res.data){
                let num = flat ? flat.length : 0
                flat = flat.concat(flatFunc(res.data,num+2).area)
                if(this.sliceBoolean){ // 判断是否需要项目类型
                    this.type[0].children.push({label:'项目类型',id:'R777',index:num+1,tier:0,children:res.data})
                }else{
                    res.data.forEach(item=>{
                        this.type.push(item)
                    })
                }
            }else{
                throw new Error(`接口data数据为空！`)
            }
        }
    },

    // 后台项目类型
    backProject:{
        url:'/info/project/getAllFinanceType',
        success:function(res){
            if(res.data){
                let num = flat ? flat.length : 0
                flat = flat.concat(flatFunc(res.data,num+2).area)
                if(this.sliceBoolean){ // 判断是否需要项目类型
                    this.type[0].children.push({label:'项目类型',id:'R777',index:num+1,tier:0,children:res.data})
                }else{
                    res.data.forEach(item=>{
                        this.type.push(item)
                    })
                }
            }else{
                throw new Error(`接口data数据为空！`)
            }
        }
    }
}


// 业务类型类
/**
 * 业务模块
 * 获取各个业务类型
 * @class Business
 */
class Business{
    constructor(){
        this.action = {} // action
        this.select = {}
    }

    /**
     * 实例化Business类
     * @static
     * @param {*} argument
     * @returns
     * @memberof Business
     */
    static getInstance(){
        if(!this.instance){
            this.instance = new Business()
        }
        return this.instance
    }

    /**
     * Business模块初始化
     * @memberof Business
     */
    async init(params={},{bool=true,prot=[]}){
        this.sliceBoolean = bool // 是否包含全部或者普通审批
        this.action = params.updateFocus === true ? this.actionPlan() : this.actionPlan(false,this.action) // 焦点数据
        flat = []
        if(params.reset === true){ // 
            await this.structure(bool,prot)
        }else{
            if(!this.type){
                await this.structure(bool,prot)
            }
        }
        this.flatData = flat
        console.log(this.type,'____type')
    }
    // 树结构数据展示
    async structure(boolean,prot){
        if(typeof boolean !== 'undefined'){
            this.catchBoolean = boolean
        }
        let bool = typeof boolean === 'undefined' ? boolean : this.catchBoolean
        let arr = prot.length === 0 ? bool ? ['general','project'] : ['backProject'] : prot
        this.type = bool ? [{label:'全部',id:999,index:0,children:[]}] : []
        for(let i=0;i<arr.length;i++){
            await this.request(examine[arr[i]].url,{},examine[arr[i]].success)
        }
    }

    /**
     * 接口请求
     *
     * @param {*} url
     * @param {*} params
     * @param {*} success
     * @param {*} [error=undefined]
     * @returns
     * @memberof Business
     */
    async request(url,params,success,error=undefined){
        let successFunc = success ? (res)=>{success.call(this,res)} : (res)=>{
            this.type = res.data
        }
        await $Lib.post(url,params,successFunc,error)
        return this
    }

    /**
     * 行动焦点，行动焦点方法主要是为了重置化焦点Dom操作
     * @param {*} res 需要焦点的数据
     * @memberof Business
     */
    actionPlan(func,res,remove=false){
        this.action = res ? res : {}
        if(remove){
            $('#business_tree *').removeClass('business_focus')}
        if(typeof func === 'function'){
            return func(this.action)
        }
    }
    /**
     * 抛出流程列表模块实例
     * @param {*} params
     * @returns
     * @memberof Business
     */
    process(params,brush=true){
        if(!this.getProcess){
            this.getProcess = Process(params ? params : this.action,$Lib)
        }
        if(brush) this.getProcess = Process(params ? params : this.action,$Lib)
        return this.getProcess
    }

    processStore(obj){
        this.processParams = obj
        return this
        if(typeof obj === 'object' && !Array.isArray(obj)){
            console.log(obj,obj.dialogTitle,'____obj,obj.dialogTitle')
            this.processParams = {
                progStageName:obj.currentImplementStageName || '', // 项目阶段名称
                progStageId:obj.currentStageId || '', // 项目阶段id
                finaTypeName:obj.financingName || '', // 业务类型 financingName
                finaTypeId:obj.financingId || '', // 业务类型id financingId
                procTypeId:obj.procTypeId || '', // 审批类型id
                projectName:obj.name || '',
                projectId:obj.id || '',
                code:obj.code || ''
            }
        }else{
            this.processParams = undefined
        }
        return this
    }
    actionClass(dom){
        let JQDom = $(dom)
        if(JQDom.attr('data-label') !== '普通审批'){
            JQDom.parent().parent().addClass('highlight').eq(0).addClass('business_focus scroll_focus')
        }else{
            JQDom.parent().parent().addClass('highlight').eq(0).addClass('business_focus')
        }
    }
    /**
     * 树结构查询事件通过label与jq的属性选择器查询即可
     * @param {*} str
     * @returns
     * @memberof Business
     */
    query(str,dir){ 
        if(typeof str !== 'string') throw new Error(str)
        $('#business_tree *').removeClass('highlight business_focus')
        this.sum = 0
        if(str.trim() !== ''){
            nodeArr = []
            flat.forEach(res=>{
                if(dir === 'all' ? res.label === str : res.label.includes(str)){
                    nodeArr.push(res)
                }
            })

            this.sum = nodeArr.length
            if(nodeArr.length > 0){
                // if(str !== '普通审批'){
                //     nodeArr.parent().parent().addClass('highlight').eq(0).addClass('business_focus scroll_focus')
                // }else{
                //     nodeArr.parent().parent().addClass('highlight').eq(0).addClass('business_focus')
                // }
                nodeArr.forEach((res,int)=>{
                    if(int !== 0){
                        $(`div[data-index="${res.index}"]`).parent().parent().addClass('highlight').eq(0).addClass('business_focus')
                    }
                })
                this.actionPlan(false,nodeArr[0])
                // setTimeout(()=>{
                //     this.scrollBar(nodeArr.get(0))
                // },200)
            }
            this.focusIndex = 0
        }
        return nodeArr
    }

    /**
     * 焦点移动方法
     * @param {*} dir 焦点上下移动指令
     * @returns
     * @memberof Business
     */
    focus(dir){
        let focus = {
            down(){ this.focusIndex = this.focusIndex < nodeArr.length -1 ? this.focusIndex+1 : this.focusIndex },
            up(){ this.focusIndex = this.focusIndex > 0 && nodeArr.length > 0 ? this.focusIndex-1 : 0 }
        }
        focus[dir].call(this)
        if(nodeArr[this.focusIndex]){
            nodeArr.forEach((res,int)=>{
                if(int !== this.focusIndex){
                    $(`div[data-index="${res.index}"]`).parent().parent().addClass('highlight').eq(0).addClass('business_focus')
                }
            })
            this.actionPlan(false,nodeArr[this.focusIndex])
        }
        return nodeArr[this.focusIndex]
    }
    /**
     * 焦点集群点击事件
     * @param {*} event
     * @param {*} str
     * @returns
     * @memberof Business
     */
    focusClick(event,str){
        let JQdom = $(event.target)
        let childrenDom
        if(!JQdom.attr('data-index')){
            childrenDom = JQdom.find('[data-index]').get(0)
        }else{
            childrenDom = event.target
        }
        // 从dom集群中定位位置
        nodeArr.forEach((item,index)=>{
            if(childrenDom){
                if(item.index.toString() === childrenDom.getAttribute('data-index')){
                    this.focusIndex = index
                }else{
                    $(`div[data-index="${item.index}"]`).parent().parent().addClass('highlight').eq(0).addClass('business_focus')
                }
            }
        })
        return this
    }

    // 滚动条滚动事件
    scrollBar(res){
        let height = $('.tree_view').height()
        let offset = res.position()
        let viewOffset = $('.tree_view').offset()
        if(offset){
            $('.tree_view').animate({'scrollTop':offset.top-200},200)
        }
    }
    /**
     * 树结构新增数据
     * @param {*} index 插入的位置
     * @param {*} data 要插入的数据
     * @returns
     * @memberof Business
     */
    add(index,data){
        return this.type[index] ? this.type.slice(index,0,data) : this.type.append(data)
    }

}

let Instance = (lib={})=>{
    $Lib = lib
    return Business.getInstance()
}
export default Instance