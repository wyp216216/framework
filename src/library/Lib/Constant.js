// 表格抬头
let tableHeader = [
    {name:'审批流程名称',width:'150',key:'procName'},
    {name:'审批类型',width:'',key:'procTypeName'},
    {name:'业务类型',width:'',key:'finaTypeName'},
    {name:'项目阶段',width:'',key:'progStageName'},
    {name:'流程描述',width:'150',key:'procDescr'},
    {name:'是否可用',width:'100',key:'available'},
    {name:'不可用原因',width:'150',key:'availableReason'},
]

// 查询表单数据
let search = [
    {type:'input',label:'审批流程名称',key:'procName',placeholder:'请输入审批流程名称'},

    {type:'inputSelect',label:'审批类型',key:'financingName',placeholder:'请选择审批类型'},    // {type:'select',label:'审批类型',key:'procTypeId',placeholder:'全部',children:[
    //     {procTypeId:'全部',id:'R222'}
    // ]},
    {type:'select',label:'项目阶段',key:'procTagId',placeholder:'全部',children:[
        {procTagId:'全部',id:'R222'}
    ]},
    {type:'select',label:'是否可用',key:'available',placeholder:'全部',children:[
        {available:'全部',id:'R222'},
        {available:'可用',id:'1'},
        {available:'不可用',id:'0'},
    ]},
]


let virtualData = []


export {tableHeader,search,virtualData}