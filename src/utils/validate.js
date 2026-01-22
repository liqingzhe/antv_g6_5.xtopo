/**
 * Created by PanJiaChen on 16/11/18.
 */

/**
 * @param {string} path
 * @returns {Boolean}
 */
export function isExternal(path) {
    return /^(https?:|mailto:|tel:)/.test(path)
}

/**
 * @param {string} str
 * @returns {Boolean}
 */
// 登录用户名验证
export const validUsername = (rule, value, callback, label) => {
        const usernameRule = /^[0-9A-Za-z_]{6,18}$/
        if (value === '') {
            callback(new Error(`请输入${label}`));
        } else if (!usernameRule.test(value)) {
            callback(new Error('只能包含英文字母、数字、下划线,6-18位字符'))
        } else {
            callback()
        }
    }
    // 用户名称验证
export const validUserName = (rule, value, callback, label = '人员名称') => {
    const usernameRule = /^[0-9A-Za-z_\u4e00-\u9fa5]{2,18}$/
    if (value === '') {
        callback(new Error(`请输入${label}`));
    } else if (!usernameRule.test(value)) {
        callback(new Error('只能包含中文、英文字母、数字、下划线,2-18位字符'))
    } else {
        callback()
    }
}

// 登录密码验证
export const validPassword = (rule, value, callback) => {
        const passwordRule = /^[0-9A-Za-z~!@#$%^&*()_+=-{}[|:;"'<>?,./]{6,16}$/
        if (value === '') {
            callback(new Error('请输入密码'));
        } else if (!passwordRule.test(value)) {
            callback(new Error('密码仅支持英文字母、数字、特殊字符,6-16位字符'))
        } else {
            callback()
        }
    }
    // 控制机IP
export const validControlIp = (rule, value, callback) => {
        if (value == '') {
            callback(new Error('请输入控制机IP'));
        } else {
            callback()
        }
    }
    // 控制机端口
export const validControlPort = (rule, value, callback) => {
    if (value == '') {
        callback(new Error('请输入控制机端口'));
    } else {
        callback()
    }
}

// 媒体源IP
export const validMediaIp = (rule, value, callback) => {
        if (value == '') {
            callback(new Error('请输入媒体源IP'));
        } else {
            callback()
        }
    }
    // 媒体源端口
export const validMediaPort = (rule, value, callback) => {
    if (value == '') {
        callback(new Error('请输入媒体源端口'));
    } else {
        callback()
    }
}



// 验证ip地址
export const validIp = (rule, value, callback) => {
    const reg = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/
    if (value === '') {
        callback(new Error('请输入ip'));
    } else if (!reg.test(value)) {
        callback(new Error('请输入合法ip'));
    } else {
        callback()
    }
}

// 非必填项验证Ip
export const validUnnecessaryIp = (rule, value, callback) => {
    const reg = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/
    if (value === '') {
        callback()
    } else if (!reg.test(value)) {
        callback(new Error('请输入合法ip'));
    } else {
        callback()
    }
}

// 节点id验证
export const validNodeId = (rule, value, callback) => {
        const usernameRule = /^[0-9A-Za-z_]{16}$/
        if (value === '') {
            callback(new Error('请输入节点ID'));
        } else if (!usernameRule.test(value)) {
            callback(new Error('仅包含英文字母、数字16位字符数'))
        } else {
            callback()
        }
    }
    /**
     * @param {string} url
     * @returns {Boolean}
     */
export function validURL(url) {
    const reg = /^(https?|ftp):\/\/([a-zA-Z0-9.-]+(:[a-zA-Z0-9.&%$-]+)*@)*((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])){3}|([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.(com|edu|gov|int|mil|net|org|biz|arpa|info|name|pro|aero|coop|museum|[a-zA-Z]{2}))(:[0-9]+)*(\/($|[a-zA-Z0-9.,?'\\+&%$#=~_-]+))*$/
    return reg.test(url)
}

/**
 * @param {string} str
 * @returns {Boolean}
 */
export function validLowerCase(str) {
    const reg = /^[a-z]+$/
    return reg.test(str)
}

/**
 * @param {string} str
 * @returns {Boolean}
 */
export function validUpperCase(str) {
    const reg = /^[A-Z]+$/
    return reg.test(str)
}


/**
 * @param {string} email
 * @returns {Boolean}
 */
export function validEmail() {
    // const reg = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    // return reg.test(email)
}

/**
 * @param {string} str
 * @returns {Boolean}
 */
export function isString(str) {
    if (typeof str === 'string' || str instanceof String) {
        return true
    }
    return false
}

/**
 * @param {Array} arg
 * @returns {Boolean}
 */
export function isArray(arg) {
    if (typeof Array.isArray === 'undefined') {
        return Object.prototype.toString.call(arg) === '[object Array]'
    }
    return Array.isArray(arg)
}


export const validName = (rule, value, callback, label = '') => {
    const nameRule = /^[a-zA-Z0-9_()-\\.\u4e00-\u9fa5]{1,30}$/
    if (!value) {
        callback(new Error(`请输入${label}`));
    } else if (!nameRule.test(value)) {
        callback(new Error('只能输入字母、数字、下划线、单个横线、点、汉字且长度在1~30字符之间'))
    } else {
        callback()
    }
}

// 手机号验证
export const validPhone = (rule, value, callback) => {
    const phoneRule = /^1[0-9]{10}$/
    if (!value) {
        callback(new Error('请输入电话号码'));
    } else if (!phoneRule.test(value)) {
        callback(new Error('请输入正确电话号码'))
    } else {
        callback()
    }
}