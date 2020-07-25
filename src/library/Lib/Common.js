class commonFuncLib{
    constructor(argument){
        this.axios = argument
    }

    static getInstance(argument){
        if(!this.instance){
            this.instance = new commonFuncLib(argument)
        }
        return this.instance
    }
    /**
     * axios-post请求
     * @param {*} url 请求的url
     * @param {*} params 请求的参数
     * @param {*} success 请求成功后执行的方法
     * @param {*} error 请求失败后执行的方法
     * @returns
     * @memberof commonFuncLib
     */
    post(url,params,success,error=undefined){
        return this.axios.post(url,params).then((res)=>{
            if(res.code.toString() === '0'){
                if(success){return success(res)}
            }else{
                throw new Error(`res.code为${res.code},${res.msg}`)
            }
        }).catch(err=>{
            if(error){ 
                return error(err) 
            }else{ 
                console.log(err)
                throw new Error(`${err.status}:message:${err.data},path:${url}`)
            }
        })
    }
    async asyncPost(url,params,success,error=undefined){
        // if(params.projectId && params.data && params.data.projectId){
        //     Object.assign(params,{
        //         projectId : params.data.projectId
        //     })
        // }
        console.time()
        return await this.axios.post(url,params).then((res)=>{
            console.timeEnd()
            console.log('________________',url)
            if( res && res.code.toString() === '0'){
                if(success){return success(res)}
            }else{
                // throw new Error(`res.code为${res.code},${res.msg}`)
            }
        }).catch(err=>{
            console.timeEnd()
            console.log(err,'________________',url)
            if(error){ 
                return error(err) 
            }else{ 
                throw new Error(`${err.status},url:${url},${err}`)
            }
        })
    }
    /**
     * 判断元素是否在可视区域内
     * @param {*} el
     * @returns
     * @memberof commonFuncLib
     */
    isElementInViewport(el) {
        //获取元素是否在可视区域
        let rect = el.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <=
            (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <=
            (window.innerWidth || document.documentElement.clientWidth)
        );
    }

    scrollIntoView(el){
        let bool = this.isElementInViewport(el)
        if(!bool){
            el.scrollIntoView({behavior:'smooth',block:'center'})
            if(this.setTime) clearTimeout(this.setTime)
            this.setTime = setTimeout(()=>{
                this.scrollIntoView(el)
            },500)
        }
    }
}

let Instance = (argument)=>{
    return commonFuncLib.getInstance(argument)
}

export default Instance