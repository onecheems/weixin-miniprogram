const { http } = require('../../../utils/util')
Component({
  options: {
    addGlobalClass: true,
  },
  lifetimes: {
    attached: async function () {
      const openid = wx.getStorageSync('openid')
      if (!openid) {
        this.buttonState = '立即申请'
      } else {
        this.fetchInitData(openid);
      }
    },
  },
  data: {
    // 底部申请按钮状态: true, 复制信息; false, 立即申请
    buttonState: '立即申请',
    mysqlInfo: {
      host: '主机名',
      port: '端口号',
      username: '用户名',
      password: '密码',
      database: '数据库'
    },
    // 全局加载
    loading: false,
    // 模态框
    modal: false
  },
  methods: {
    showModal(e) {
      // button 是复制信息
      if (this.data.buttonState === '复制信息') {
        let mysqlInfoString = ''
        Object.entries(this.data.mysqlInfo).forEach(item => {
          mysqlInfoString += `${item[0]}: ${item[1]}\n` 
        })
        const mysqlInfoArr = mysqlInfoString.split('')
        mysqlInfoArr.pop()
        wx.setClipboardData({
          data: mysqlInfoArr.join(''),
        })
        return
      }
      this.setData({
        modalName: e.currentTarget.dataset.target
      })
    },
    hideModal(e) {
      this.setData({
        modalName: null
      })
    },
    async iknow() {
      this.hideModal()
      this.setData({
        loading: true
      })
      const code = await this.getLoginCode()
      // TODO: 注册逻辑
      const { data: authRes } = await http({ url: '/weixin/auth', method: 'POST', data: { code } })
      if (authRes.code !== 0) {
        this.setData({
          loading: false
        })
        wx.showToast({
          icon: 'none',
          title: '请求出错，请重试！',
        })
        return
      }
      const openid = authRes.data.openid
      // wx.setStorageSync('openid', authRes.openid)
      const { data: mysqlRes } = await http({ url: '/weixin/mysql', method: 'POST', data: { openid: openid } })
      if (mysqlRes.code !== 0) {
        this.setData({
          loading: false
        })
        wx.showToast({
          icon: 'none',
          title: '请求出错，请重试！',
        })
        return
      }
      this.setData({
        'mysqlInfo.host': mysqlRes.data.host,
        'mysqlInfo.port': mysqlRes.data.port,
        'mysqlInfo.username': mysqlRes.data.username,
        'mysqlInfo.password': mysqlRes.data.password,
        'mysqlInfo.database': mysqlRes.data.database
      })
      this.setData({
        loading: false
      })
      this.setData({
        buttonState: '复制信息'
      })
      wx.setStorageSync('openid', openid)
    },
    async getLoginCode() {
      const { code } = await wx.login()
      return code
    },
    async fetchInitData(openid) {
      this.setData({
        loading: true
      })
      const { data: initRes } = await http({ url: `/weixin/mysql/info`, method: 'POST', data:{
        openid
      } })
      if (initRes.code !== 0) {
        this.setData({
          loading: false
        })
        wx.showToast({
          icon: 'none',
          title: '请求出错，请重试！',
        })
        return
      }
      const info = initRes.data
      this.setData({
        'mysqlInfo.host': '139.9.130.66',
        'mysqlInfo.port': 3306,
        'mysqlInfo.username': info.db_user,
        'mysqlInfo.password': info.db_password,
        'mysqlInfo.database': info.db_name
      })
      this.setData({
        buttonState: '复制信息'
      })
      this.setData({
        loading: false
      })
    }
  }
})