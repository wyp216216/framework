class Conmon{
    constructor(...data){
        data[0].protypeId = 'type1'
        this.params = this[data[0].protypeId](...data)
    }

    type1(...data){
        return {
            form:[
                '单选框',
                '下拉框'
            ],
            contion:{
                
            }
        }
    }
    type2(){

    }
    type3(){

    }
}