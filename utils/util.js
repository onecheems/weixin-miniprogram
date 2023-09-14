const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

async function http(option) {
  const baseUrl = 'https://weixin.api.pengjinwei.cn:3000'
  if (option && option.url) {
    option.url = baseUrl + option.url
  }
  return new Promise((resolve, reject) => {
    wx.request({
      ...option,
      success: (result) => resolve(result),
      fail: (result) => reject(result)
    })
  })
}

module.exports = {
  formatTime: formatTime,
  http: http
}
