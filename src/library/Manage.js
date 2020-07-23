import MODULES from './Public/ModulePublic'

class Manage{
    constructor(){
        this.area = {}
    }
    static GetInstance(){
        if(!this.instance){
            this.instance = new Manage()
        }
        return this.instance
    }

    // 仓库声明模块
    sign(name,...params){
        if(name && !this.area[name]){
            this.area[name] = new MODULES[`__${name.trim().toUpperCase()}`](...params)
        }
        return this.area[name]
    }
    
    // 仓库读取数据
    read(key,...params){
        console.log(key,MODULES)
        if(this.area[key]){
            return this.area[key]
        }else if(MODULES[`__${key.trim().toUpperCase()}`]){
            this.area[key] = new MODULES[`__${key.trim().toUpperCase()}`](...params)
            return this.area[key]
        }
        throw new Error('无法找到该模块！')
    }

    // 重置仓库某实例
    rese(name,...params){
        this.area[name] = new MODULES[`__${name.trim().toUpperCase()}`](...params)
        return this.area[name]
    }

    /**
     * @name {*} name格式————————“<模块名-string>:<约定-string>”
     * @param {*} params 
     * @returns 
     * @memberof Manage 
     */
    notice(name,...params){
        let namespace = name.search(':') === 1 ? name.split(':') : name.search(':') === 0 ? [name] : undefined
        if(namespace){
            Array.isArray(namespace) ? this.area[namespace[0]](namespace[1]) : undefined
        }
        return this
    }
}

export default Manage.GetInstance()