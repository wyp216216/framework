import PortIndex from './Public/PortPublic'
import store from '@/store/index';
import axios from 'axios'; // 引入axios
import code from '@/pages/common/js/code.js' // 引入公共的js
import ElementUI from 'element-ui' // 引入element
import 'element-ui/lib/theme-chalk/index.css'
// 每实例化一个接口则是基于一个模块

class Port {
    constructor(params,methods=()=>{}){

        // 生成实例名称
        this.name = params.name
        
        // 生成系统集群
        this.troop = PortIndex[`__${params.name.trim().toUpperCase()}`]

        // 模块data数据
        this.data = params.data ? params.data : {}
        
        this.custom = {} // 自定义区域执行
        this.before = {}
        this.axios = axios
        this.methods = (...res)=>{
            console.log(params.methods,'____methods')
            return params.methods(...res)
        }
    }

    // 数据集群注册
    scope(name,params,...data){
        if(typeof name !== 'string' || Array.isArray(params) || typeof params !== 'object' ) throw new Error(`参数不正确！`)
        let arr = name.split(':')
        if(arr[0] === 'before'){ Object.assign(this.before,{ 
            [name]:{ name:params.name,data:params.data || {} ,success:params.custom } 
        }) }
        Object.assign(this.custom,{ [name]:params })
        return this.custom
    }

    // 激活注册的数据集群
    action(name){
        let arr = name.split(':')
        if(arr.length !== 2 || !this[`${arr[0]}Use`]) throw new Error('未识别可执行函数规范！')
        if(arr[0] !== 'before' && arr[0] !== 'after'){
           return this.custom[name] ? 
                this[`${arr[0]}Use`](this.custom[name]) : 
                (()=>{throw new Error(`未定义执行模块！`)})()
        }else{
            throw new Error(`before,after非主动执行函数规范！`)
        }
    }

    // 异步集群调用机制
    asyncUse(params){
        console.log(params)
    }

    // 同步集群调用机制
    notAsyncUse(params){
        
    }

    // 前置集群调用机制
    beforeUse(params){ 
        
    }

    // axios 调试实例
    interceptors(example){
        const interceptors = {

            //发送请求之前拦截
            request:()=>{
                example.interceptors.request.use((config) => {
                    // 每次发送请求之前判断vuex中是否存在token
                    // 如果存在，则统一在http请求的header都加上token，这样后台根据token判断你的登录情况
                    // 即使本地存在token，也有可能token是过期的，所以在响应拦截器中要对返回状态进行判断
                    // if(store.state.projectMsg.pro_id && store.state.projectMsg.stopProjectId){
                    //   store.commit("stopProjectId", '')
                    // }
                    if (config.data.private || config.data.projectId) { // 项目私有的
                        config.data.projectId = config.data.projectId || config.data.data.projectId
                    } else if (!config.data.projectId && config.data.projectId !== 0) {
                        config.data.projectId = store.state.projectMsg.pro_id;
                    } else if (store.state.projectMsg.pro_id == '') {
                        config.data.projectId = 0;
                        if (store.state.projectMsg.stopProjectId != '') {
                            config.data.projectId = store.state.projectMsg.stopProjectId;
                            store.commit('stopProjectId', '');
                        }
                    }
                    config.data.token = store.state.loginObject.userToken;
                    config.data.userId = store.state.loginObject.userId;
                    config.data.loginType = store.state.isPC ? 'pc' : 'web';
                    for (let key in config.data.data) {
                        var str = config.data.data[key]
                        var flag = true;
                        if (typeof str == 'string') {
                            try {
                                var obj = JSON.parse(str);
                                if (typeof obj == 'object' && obj) {
                                    flag = false;
                                } else {
                                    flag = true;
                                }
                            } catch (e) {
                                flag = true;
                            }
                            if (flag) {
                                config.data.data[key] = config.data.data[key].replace(/"/g, '”');
                            }
                        }
                    }
                    return config;
                },(error) => {
                    return Promise.reject(error);
                })
            },

            //返回响应之后拦截
            response:()=>{
                example.interceptors.response.use((response) =>{
                    // console.log("*************",ElementUI);
                    // console.log(code.codeNum.TOKEN_ERROR);
                    // 如果返回的状态码为200，说明接口请求成功，可以正常拿到数据
                    // 否则的话抛出错误
                    // console.log(response.data);
                    // console.log(code.codeNum.NOT_PERMISSION);

                    if (response.data.code == code.codeNum.TOKEN_ERROR) {
                        ElementUI.Message.error('登录状态已失效需要跳到登录页面');
                        window.closeUploadDialog && window.closeUploadDialog()
                        setTimeout(function() {
                            sessionStorage.removeItem('login');
                            window.location.href = '/';
                        }, 2000);
                        return;
                    }
                    if (response.status === 200) {
                        return Promise.resolve(response);
                    } else {
                        return Promise.reject(response);
                    }
                }, (error) => {
                    if (error.response && error.response.status) {
                        switch (error.response.status) {
                            // 401: 未登录
                            // 未登录则跳转登录页面，并携带当前页面的路径
                            // 在登录成功后返回当前页面，这一步需要在登录页操作。
                            case 401:
                            router.replace({
                                path: '/login',
                                query: {
                                redirect: router.currentRoute.fullPath
                                }
                            });
                            break;
                    
                            // 403 token过期
                            // 登录过期对用户进行提示
                            // 清除本地token和清空vuex中token对象
                            // 跳转登录页面
                            case 403:
                            ElementUI.Message.error('登录过期，请重新登录！');
                            // 清除token
                            localStorage.removeItem(user_info);
                            window.closeUploadDialog && window.closeUploadDialog()
                            // store.commit('loginSuccess', null);
                            // 跳转登录页面，并将要浏览的页面fullPath传过去，登录成功后跳转需要访问的页面
                            setTimeout(() => {
                    
                                router.replace({
                                path: '/login',
                                query: {
                                    redirect: router.currentRoute.fullPath
                                }
                                });
                            }, 1000);
                            break;
                    
                            // 404请求不存在
                            case 404:
                            ElementUI.Message.error('网络请求不存在！');
                            break;
                            // 500请求不存在
                            case 500:
                            ElementUI.Message.error('网络异常！');
                            break;
                            // -501请求不存在
                            case 501:
                            ElementUI.Message.error('网络异常！');
                            break;
                            case 502:
                            ElementUI.Message.error('网络异常！');
                            break;
                            case 503:
                            ElementUI.Message.error('网络异常！');
                            break;
                            case 504:
                            ElementUI.Message.error('网络异常！');
                            break;
                            // 其他错误，直接抛出错误提示
                            default:
                            // ElementUI.Message.error("网络异常！");
                            break;
                        }
                        return Promise.reject(error.response);
                    } else {
                        // console.log('error',error.message)
                        // 上传文件中轮询网络状况时不提示错误信息
                        // !window.Netchecking && ElementUI.Message.error("网络异常！");
                        return Promise.reject(error.message)
                    }
                })
                return this
            },
            removeRequest:() => {
                example.interceptors.request.eject(this.interceptors().request)
                return this
            },
            removeResponse:() => {
                example.interceptors.response.eject(this.interceptors().response)
                return this
            }
        }
        return interceptors
    }

    merge(params,data){
        for(let i in data){
            console.log(data[i],typeof data[i],data,'___data[i')
            if(typeof data[i] !== 'function'){
                Object.assign(params,{[i]:data[i]})
            }else{
                console.log(data[i](),'_____data[i]()')
                Object.assign(params,{[i]:data[i]()})
            }
        }
        return params
    }

    status(name,params={}){

        // 模块数据合并
        params = this.merge(params,this.data)
        let msg = { name:name }
        for(let i in this.troop){
            if(this.troop[i][name]){
                Object.assign(msg,{type:i,url:this.troop[i][name]})
            }
        }
        console.log(msg,'____msg')
        let data = Object.assign({
            // `url` 是用于请求的服务器 URL
            url: `${msg.url}`,
            // `method` 是创建请求时使用的方法
            method: msg.type // 默认是 get
        })
        switch(msg.type.toUpperCase()){
            case 'GET':
                Object.assign(data,{params: params,})
                break;
            case 'POST':
                Object.assign(data,{data: params,})
                break;
            default:
                Object.assign(data,{data: params,method: 'post'})
        }
        let libAxios = axios.create({
            baseURL:allUrl,
            // withCredentials: true,
        })
        // 
        this.interceptors(libAxios).request()
        this.interceptors(libAxios).response()
		return {
            instance:libAxios,
            data:data,
            methods:(res)=>{
                console.log(res)
            }
        }
    }
    
    // 接口调用
    use(name,params){
        let payout = {
            string(){
                let communica = this.status(name,params.data)
                Object.assign(communica,{custom:params.custom})
                for(let i in this.before){
                    if(this.before[i].name.indexOf(name) !== -1){
                        Object.assign(communica.data.data ? communica.data.data : communica.data.params,this.before[i].data)
                        return this.send(communica,this.before[i].success)
                    }
                }
                return this.send(communica)
            },
            array(){
                let message = name.map(res=>{
                    let communica = this.status(res.name,res.data)
                    for(let i in this.before){
                        if(this.before[i].name.indexOf(res.name) !== -1){
                            Object.assign(communica,{before:this.before[i].success,custom:res.custom})
                            if(communica.data.data){
                                communica.data.data = this.merge(communica.data.data,this.before[i].data)
                            }else{
                                communica.data.params = this.merge(communica.data.params,this.before[i].data)
                            }
                        }
                    }
                    return communica
                })
                this.send(message)
            }
        }
        
        typeof name === 'string' ? payout.string.call(this) : Array.isArray(name) ? payout.array.call(this) : undefined // 判断name的值为字符串还是数组，分别执行不同的方法
    }

    // 发起请求
    send(msg,func){
        let instant = Array.isArray(msg) ? msg.shift() : msg
        if(instant.data.data){
            instant.data.data = this.merge(instant.data.data,instant.data.data)
        }else{
            instant.data.params = this.merge(instant.data.params,instant.data.params)
        }

        console.log(instant.data,'____instant')

        instant.instance(instant.data).then((...res) => {

            let ModuleStart = typeof this.methods === 'function' ? this.methods(...res) : undefined // 模块方法

            let BlockStart = func ? func(ModuleStart,...res) : instant.before ? instant.before(ModuleStart,...res) : undefined // 接口块方法

            typeof instant.custom ==='function' ? instant.custom(BlockStart,...res) : undefined // 单接口方法

            Array.isArray(msg) && msg.length > 0 ? this.send(msg,func) : undefined // 若msg为数组则递归回执

        }).catch(err => {
            throw new Error(err)
        })
    }
}

export default Port