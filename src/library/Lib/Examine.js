
let $Lib
let projectList = []
let examineType = {
    1:'普通审批',
    2:'文件审批',
    3:'目录审批',
    4:'底稿审批',
    5:'阶段审批',
    6:'项目终止审批',
    7:'新建项目审批',
    8:'底稿归档审批',
    9:'底稿借阅审批',
    10:'文件修订审批',
    11:'底稿目录修订审批',
}
let ajaxArea = {
    getProjectPaperFileParentId:{
        url:'/doc/paper/getProjectPaperFileParentId',
        success:function(res){
            
        }
    },
    formDetailNew:{
        url:'/info/audit/formDetailNew',
        success:function(res){
            this.formDetailArea = res.data
            this.copyNameStore = res.data.copyName;
            this.approvalNameStore = res.data.approvalName;
            this.copyNameCode = res.data.copyCode;
            if(this.approvalsForm.isMultiDept){
                this.approvalsForm.isMultiDept = false
            }
        }
    },
    //查询当前项目已完成未归档的阶段
    incomplete:{
        url:'/info/projectSealUp/queryIsSealFlag',
        success:function(res){
            this.noFileStage = res.data;
            let arr = this.noFileStage.map((item) => {
                return item.name
            })
            this.noFileStageJoin = arr.filter(res=>res !== '').join(',')
        }
    },
    //查询阶段下的设为底稿的审批通过的文件集合
    findIsExistPassFile:{
        url:'/doc/paper/findIsExistPassFile',
        success:function(res){

        }
    },
    project:{
        url:"/info/project/getSimpleProjectList",
        success:function(res){ 
            projectList = res.data || []
            // res.data.forEach(item=>{
            //     projectList.push(item)
            // })
        }
    },
    phase:{
        url:"/info/audit/current_project_use",
        success:function(res){ return res.data }
    },
    detail:{
        url:"/info/audit/form_detail",
        success:function(res){
            // approvalName: (3) ["李永帅", "李永帅3", "李永帅2"] //执行人
            // approveType: "会签" // 或签，会签
            // copyCode: [] // 抄送人
            // copyName: [] // 抄送人
            // form: [] // 弹窗模块内容
            // isMultiDept: false // 是否为多个部门 
            // needAgainQuery: false // 是否同意查询 
            // noAudit: false // 没有审批人 
            // noCopyUser: false // 没有抄送人 
            let copyNameArr = Array.isArray(res.data.copyName) ? res.data.copyName : [] 
            let copyCodeArr = Array.isArray(res.data.copyCode) ? res.data.copyCode : []
            Object.assign(this.approvalsForm ,res.data,{
                // 抄送人信息
                get copyMessage(){
                    return copyNameArr.map((name,i) => ({name, id: copyCodeArr[i],label: name, uniqueKey: 'user' + copyCodeArr[i],originData: true}));
                }
            })
            return res.data
        }
    },
    message:{
        url:"/info/audit/formDetailNew",
        success:function(res){

        }
    },
    // 根据项目id查询流程图信息
    flow:{
        url:'/info/service/getProcessInfoByProjId',
        success:function(res){
            if(res.code === 200){
                this.flowMsg = res.data // 流程图信息
            }
        }
    }
}


/**
 * 审批模块
 * 需要判断是否为多部门，
 * 不同的审批阶段执行不同的逻辑代码
 * @class Examine
 */
class Examine{
    constructor(message,project){
        
        this.name = message.procName // 项目名称
        this.projectMsg = project
        // 项目列表
        this.projectList = projectList
        this.approvalsForm = {
            copyName:'',
            copyCode:'',
            isMultiDept:'',
            copyMessage:[]
        }
        console.log(project.financingName,message.finaTypeName,'____message.finaTypeName')
        console.log(message.finaTypeName == '' || message.finaTypeName == null ? project && project.financingName !== ''  ? project.financingName : '无' : message.finaTypeName)
        // 业务类型
        this.type = project && project.financingName && project.financingName !== ''  ? project.financingName :  message.finaTypeName === '' || message.finaTypeName === null ? '无' : message.finaTypeName // 业务类型
        this.procTypeId = message.procTypeId
        this.message = message
        // 多个接口公用请求参数
        this.params = {
            data: {
                modelId: message.actModelId,
                deploymentId: message.procDeployId,
                progStageId: message.progStageId,
                versionId: message.procVersionNum,
                approvalType: message.procTypeId
            }
        }
        
        // 判断是否多流程请求参数
        this.flowParams = {
            data:{
                procTypeId:this.procTypeId,
                projId:project ? project.id : ''
            }
        }
        this.launchSelect = true //是否可用发起审批
        this.launchConfirm(message.procTypeId)
    }
    async init(userDept,func,bool){
        // 1:'普通审批',
        // 2:'文件审批',
        // 3:'目录审批',
        // 4:'底稿审批',
        // 5:'阶段审批',
        // 6:'项目终止审批',
        // 7:'新建项目审批',
        // 8:'底稿归档审批',
        // 9:'底稿借阅审批',
        // 10:'文件修订审批',
        // 11:'底稿目录修订审批',
        
        
        
        // let flowSelect = [8,9]
        this.instance = this.nature() // 原型生成
        // if(flowSelect.indexOf(this.procTypeId) !== -1){
        //     await this.asyncRequest(ajaxArea.flow,this.flowParams) // 判断是否多流程请求接口
        // }
        if(this.projectMsg){
            if(this.instance.procTypeId === 8 && this.projectMsg){
                // wyp
                await this.asyncRequest(ajaxArea.incomplete,{data: { projectId: this.projectMsg.projectId }}) 
                await this.asyncRequest(ajaxArea.findIsExistPassFile,{
                    projectId: this.projectMsg.projectId,
                    data: { 
                        stageIds: this.noFileStage.map(res=>res.id).join(',')
                    }}) 
            }
            if(this.instance.procTypeId === 8 || this.instance.procTypeId === 9){
                await this.asyncRequest(ajaxArea.flow,{data: {projId: this.projectMsg.projectId ,procTypeId :this.procTypeId }}) 
            }
        }

        await this.asyncRequest(ajaxArea.detail,this.params) // 更改指针数据

        console.log(!this.approvalsForm.isMultiDept && this.projectMsg,'_____111')
        if(!this.approvalsForm.isMultiDept && this.projectMsg && bool !== true){
            // needAgainQuery为true重新查询审批人、抄送人
            console.log(this.approvalsForm.needAgainQuery,'1111')
            if(this.approvalsForm.needAgainQuery) {
                await this.formDetailNew(userDept)
            }else {
                this.copyNameCode = this.approvalsForm.copyCode; // 表单和审批环节信息抄送人code
                this.copyNameStore = this.approvalsForm.copyName; // 表单和审批环节信息抄送人
                this.approvalNameStore = this.approvalsForm.approvalName; // 表单和审批环节信息执行人
                
                this.copyNameCode = this.approvalsForm.copyCode; // 表单和审批环节信息抄送人code
                this.copyNameArray = this.approvalsForm.copyName; // 表单和审批环节信息抄送人
                this.approvalNameArray = this.approvalsForm.approvalName; // 表单和审批环节信息执行人
            }
        }

        let noGetSimpleProjectList = [3,8,9]  // 过滤获取所有项目接口数据
        if(noGetSimpleProjectList.indexOf(this.instance.procTypeId) === -1){
            if(this.projectList.length === 0){
                await this.asyncRequest(ajaxArea.project,{data: { endFlag: 0 }}) // 更改指针数据
                this.projectList = projectList
            }
        }
        if(typeof func === 'function'){
            await func(this,this.instance) // 面向指针获取数据
        }
    }

    
    async formDetailNew(userDept){
        await this.asyncRequest(ajaxArea.formDetailNew,{data: {
            projectId: this.projectMsg.projectId,
            modelId: this.message.actModelId,
            userDept: userDept,
            versionId: this.message.procVersionNum,
            deploymentId: this.message.procDeployId,
            approvalType: this.message.procTypeId, //归档
        }})
        return this
    }
    
    
    launchSure(router = ''){
        console.log(this.procTypeId)
        if(router.includes('sponsor') || router.includes('projecexamine')){
            if(this.procTypeId === 7){
                this.launchSelect = false
            }else{
                this.launchSelect = true
            }
        }else{
            this.launchSelect = true
        }
        return this.launchSelect
    }
    launchConfirm(id){
        let launchFalse = [7,9]
        if(launchFalse.indexOf(id) !== -1){
            this.launchSelect = false
        }
    }

    
    async asyncRequest(message,params,error){
        let successFunc = message.success ? (res)=>{
            message.success.call(this,res)
        } : (res)=>{
            this.storage = res.data
        }
        return await $Lib.asyncPost(message.url,params,successFunc,()=>{})
    }
    
    // 选定项目
    project(params,id,value){
        this.storage = params
        this.procTypeId = id
        this.focus = this.storage.find(res=>res.id.toString() === value.toString())
        return this
    }
    
    // 草稿
    draft(){
        let draft = this.$utils.getDraft("sponsor", false);
      // 如果没有草稿，设置定时器，返回
      return !draft ? this.setTimer() : {bool:true,content:draft}
    }
    
    // 所有类型方法调用
    audit(obj){
        if(this.message.procTypeId !== 1){
            let bool = this.limit()
            if(bool){
                return { hint:"项目所属阶段与流程图所属业务类型不匹配" }
            }
            if(this.status[this.procTypeId]){
                return this.status[this.procTypeId].call(this,obj)
            }
        }
    }
    
    
    
    // 是否多部门判断
    department(){

    }
    
    // 项目权限判定
    limit(){
        return this.focus.financingId !== this.message.finaTypeId
    }
    nature(){
        let insitance = this
        let message = this.message
        let id = this.procTypeId
        return {
            finaTypeId:message.finaTypeId, // 业务类型id
            procTypeId:id,
            procName:message.procName, // 项目名称
            progStageId:message.progStageId, // 项目阶段id
            procDeployId:message.procDeployId, // 流程部署id
            get finaTypeName(){ return insitance.type }, // 业务类型
            get moduleName(){ return id === 2 ? "待审文件" : undefined },
            get procTypeName(){ return message.procTypeName }, // 项目内容名称
            get flowChart(){ return id === 6 ? true : false }, // 流程图是否展示
            get dataSelect(){ return id === 6 ? false : true }, // 日期是否展示
            get fileExamine(){ return id === 2 ? true : false }, // 文件审批是否展示
            get catalogExamine(){ return id !== 3 ? true : false}, // 待审目录是否展示
            get documentSelect(){ return id === 2 ? false : true}, // 项目文档选择第一个参数——xmwds
            get documentSelect2(){ return id === 2 ? true : false}, // 项目文档选择第一个参数——xmwds2
            get hint(){ return id === 3 ? "请到项目文档中发起审批" : undefined },
        }
    }

    request(params,data,success){
        let successFunc = success ? success : params.success
        return $Lib.post(params.url,data,successFunc)
    }
    /**
     * 不同审批状况管理
     * 1：普通审批;2：文件审批;3：目录审批;4：底稿审批;5：阶段审批;6：项目终止审批;7：新建项目审批;8：底稿归档审批;9：底稿借阅审批;10：文件修订审批;11：底稿目录修订审批
     * @param {*} id
     * @param {*} value
     * @memberof Examine
     */
    status = {
        // 文件审批逻辑
        2:function(obj){
            return {
                code:this.message.progStageIdids === this.focus.currentStageId,
                get hint(){ return this.code ? '' : "项目所属阶段与流程图所属阶段不匹配" }
            }
        },
        // 阶段审批逻辑
        5:async function(obj){
            return await {
                code:this.message.progStageIdids === this.focus.currentStageId,
                get hint(){
                    if(!this.code){
                        return '项目所属阶段与流程图所属阶段不匹配'
                    }else{
                        let data = {pageNo: "",pageSize: "",data: { projectId: obj.ids, deploymentId: obj.procTypeIdss }}
                        let func = (res)=>{ return res.code == 0 ? !res.data ? '当前项目正在进行阶段审核' : undefined : res.data}
                        console.log(func, 'func1235')
                        return $Lib.post('/info/service/findProcessAll',func)
                    }
                }
            }
        }
    }
}

let Instance = (lib)=>{
    $Lib=lib
    return (params,id,value)=>{
        if(!params){
            projectList = []
        }else{
            return new Examine(params,id,value)
        }
    }
}
export default Instance