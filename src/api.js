export function changeShareCard(url, href, shareData) {
  axios
    .get(url, {
      params: {
        url: encodeURIComponent(href),
      },
    })
    .then((res) => {
      res = res.data;
      wx.config({
        // debug: true,
        appId: res.appid,
        timestamp: res.timestamp,
        nonceStr: res.nonceStr,
        signature: res.signature,
        jsApiList: [
          "updateAppMessageShareData",
          "updateTimelineShareData",
          "onMenuShareAppMessage",
          "onMenuShareTimeline",
        ],
      });
      wx.ready(function () {
        // 1.4.0 新接口 (只调用这个接口在安卓下是无效的)
        wx.updateAppMessageShareData(shareData);
        wx.updateTimelineShareData(shareData);
        // 1.2.0 老接口
        wx.onMenuShareAppMessage(shareData);
        wx.onMenuShareTimeline(shareData);
      });
    })
    .catch((err) => {
      console.log(err);
    });
}

export function sendUserData(code, startTime, quitTime) {
  let data = new FormData();
  data.append("code", code);
  data.append("startTime", startTime);
  data.append("quitTime", quitTime);
  navigator.sendBeacon("http://42.193.159.53:8000/userData", data);
}

export function sendCode(url, code) {
  axios.get(url, { params: { code } }).then((userInfo) => {
    console.log(userInfo.data);
    return userInfo.data;
  });
}

export function sendTimeStamp(url, userInfo) {
  let timeStamp = new Date();
  axios.post(url, {
    headers: {
      "Content-Type": "application/json",
    },
    transformRequest: [
      function (data) {
        data = JSON.stringify(data);
        return data;
      },
    ],
    data: { userInfo, timeStamp },
  });
}
