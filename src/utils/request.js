import Axios from "axios";
import store from "@/store";
import { Message, MessageBox } from "element-ui"
const BASE_URL = JSON.parse(localStorage.config).BASE_URL;
console.log(BASE_URL, 'BASE_URL')

// const baseURL = process.env.NODE_ENV === 'development' ? "http://172.16.7.230:8088" : config.BASE_URL
// 创建axios实例  
const request = Axios.create({
    baseURL: BASE_URL,
    timeout: 15000 // 超时
});
// 请求拦截
request.interceptors.request.use(
    config => {
        // do something
        const token = sessionStorage.getItem('token')
        if (token) {
            // 设置令牌请求头
            config.headers["Authorization"] = token;
        }
        // const centerId = sessionStorage.getItem('centerId')
        // if (centerId) {
        //     config.headers["centerId"] = centerId;
        // }
        return config;
    },
    error => {
        // 请求错误预处理
        // console.log(error) // for debug
        return Promise.reject(error);
    }
);

// 响应拦截
request.interceptors.response.use(
    // 通过自定义code判定响应状态，也可以通过HTTP状态码判定
    response => {

        // 仅返回数据部分
        const res = response.data;
        const token = sessionStorage.getItem('token');

        // code不为1则判定为一个错误  
        if (res.code && res.code !== 1 && res.code !== 0 && res.code !== 100 && res.code !== 101) {
            if (res.code === -2 || res.code === -9 || res.code === -10) {
                if (!token) return; // 如果token不存在 说明已经处理过登录过期的弹框 不用再弹出
                store.dispatch("user/resetToken"); // 用户信息已过期 删除用户信息及token信息 
                let str = '';
                if (res.code === -2 || res.code === -10) {
                    str = '登录已失效，请重新登录！';
                } else {
                    str = '该账号已在别的地方登录，请重新登录！';
                }
                MessageBox.alert(str, "提示", {
                    confirmButtonText: "确定",
                    type: "warning",
                    confirmButtonClass: 'confirm-btn',
                    iconClass: 'warning-icon',
                    callback: () => {
                        // 重新登录
                        window.router.push('/login');
                    }
                });
            } else {
                Message({
                    message: res.msg || 'Error',
                    type: 'error',
                    duration: 5 * 1000
                })
            }
            return Promise.reject(new Error(res.msg || "Error"));
        } else { // 请求正常
            return res;
        }

    },
    error => {
        Message({
            message: error.msg || '请求超时',
            type: 'error',
            duration: 5 * 1000
        })
        return Promise.reject(error);
    }
);

export default request;