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
        appId: res.appid,
        timestamp: res.timestamp,
        nonceStr: res.nonceStr,
        signature: res.signature,
        jsApiList: ["updateAppMessageShareData", "updateTimelineShareData"],
      });
      wx.ready(function () {
        wx.updateAppMessageShareData(shareData);
        wx.updateTimelineShareData(shareData);
      });
    })
    .catch((err) => {
      console.log(err);
    });
}

export function sendUserData(userInfo, startTime, quitTime) {
  let data = new FormData();
  data.append("userInfo", userInfo);
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
