import store from '@/store/index';
import axios from 'axios'; // 引入axios
import code from '@/pages/common/js/code.js' // 引入公共的js
import ElementUI from 'element-ui' // 引入element
import 'element-ui/lib/theme-chalk/index.css'

// axios.defaults.baseURL = process.env.API_BASE_URL   //定义请求地址
// axios.defaults.baseURL ='/api'   //定义请求地址/
axios.defaults.baseURL = allUrl // 定义请求地址
// axios.defaults.baseURL ='http://shrd.f3322.org:1066'   //定义请求地址
// axios.defaults.timeout = 60000     //请求超时
axios.defaults.headers.post['Content-Type'] = 'application/json';
axios.defaults.headers.put['Content-Type'] = 'application/json';

// // 请求拦截器
axios.interceptors.request.use(
  config => {
    // 每次发送请求之前判断vuex中是否存在token
    // 如果存在，则统一在http请求的header都加上token，这样后台根据token判断你的登录情况
    // 即使本地存在token，也有可能token是过期的，所以在响应拦截器中要对返回状态进行判断
    // if(store.state.projectMsg.pro_id && store.state.projectMsg.stopProjectId){
    //   store.commit("stopProjectId", '')
    // }
    // console.log(config.data, store.state.projectMsg.pro_id)
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
  },
  error => {
    return Promise.error(error);
  })
// // 响应拦截器
axios.interceptors.response.use(
  response => {
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

    // else if(response.data.code = code.codeNum.NOT_PERMISSION){
    //     ElementUI.Message.error("没有该权限");
    //     return;
    // }
    if (response.status === 200) {
      return Promise.resolve(response);
    } else {
      return Promise.reject(response);
    }
  },
  //     // 服务器状态码不是2开头的的情况
  //     // 这里可以跟你们的后台开发人员协商好统一的错误状态码
  //     // 然后根据返回的状态码进行一些操作，例如登录过期提示，错误提示等等
  //     // 下面列举几个常见的操作，其他需求可自行扩展
  error => {
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
  });


export default axios