import { changeShareCard, sendUserData, sendTimeStamp } from "./src/api.js";

//配置信息
let shareData = {
  title: "厚沃贷外贸贷申请流程2021最新版.pdf", // 分享标题
  desc: "1.2MB", // 分享描述
  link: window.location.origin, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
  imgUrl:
    "https://test-toney-7g5fibdd9772300d-1301993689.tcloudbaseapp.com/src/shareIcon.png", // 分享图标
  success: function () {},
};
axios.defaults.baseURL = "http://42.193.159.53:8000";

//根据信息更改标题及文件路径
document.title = shareData.title;
document.getElementsByTagName(
  "iframe"
)[0].src = `http://test.xushikang.work/reader/web/viewer.html?file=http://test.xushikang.work/src/pdf/${shareData.title}`;

function formatDateTime(date) {
  //之间转换格式
  let y = date.getFullYear();
  let m = date.getMonth() + 1;
  m = m < 10 ? "0" + m : m;
  let d = date.getDate();
  d = d < 10 ? "0" + d : d;
  let h = date.getHours();
  h = h < 10 ? "0" + h : h;
  let minute = date.getMinutes();
  minute = minute < 10 ? "0" + minute : minute;
  let second = date.getSeconds();
  second = second < 10 ? "0" + second : second;
  return y + "-" + m + "-" + d + " " + h + ":" + minute + ":" + second;
}

function pushHistory() {
  let state = {
    title: "title",
    url: "",
  };
  window.history.pushState(state, "title", "");
}

if (window.location.href.length < 30) {
  axios.get("/visitData", {
    params: {
      Date: formatDateTime(new Date()),
    },
  });
  window.location.replace(
    "https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx0e1b4f2fef3bfddd&redirect_uri=http%3A%2F%2Ftest.xushikang.work%2F&response_type=code&scope=snsapi_userinfo#wechat_redirect"
  );
} else {
  // 自定义分享卡片;
  let href = window.location.href.split("#")[0];
  changeShareCard("/customize", href, shareData);
  let code = window.location.search.split("&")[0].split("=")[1];
  let userInfo; //后端返回的用户信息
  let startTime, quitTime;

  //监听页面打开
  window.addEventListener("load", () => {
    startTime = formatDateTime(new Date());
  });

  axios.get("/userInfo", { params: { code } }).then((info) => {
    userInfo = info.data;
    console.log(userInfo);
    let isBack = false;
    let timer = setInterval(() => {
      sendTimeStamp("/timeStamp", userInfo);
    }, 3000); //开启定时器

    //监听页面后退
    pushHistory(); //在手机端微信浏览器内该方法失灵,原因：必须要与页面产生交互state才会生效
    //解决方式：（原理未知，来源：https://developers.weixin.qq.com/community/develop/doc/000a2a57968cc0bc9d7aa0b6b5b800?highLine=popstate）
    try {
      window.tbs_bridge.nativeExec("network", "type", 0, null);
    } catch (e) {
      console.error(e);
    }
    window.addEventListener(
      "popstate",
      function () {
        isBack = true;
        quitTime = formatDateTime(new Date());
        sendUserData(code, startTime, quitTime);
        wx.closeWindow();
      },
      false
    );

    //监听页面状态并启停计时器
    window.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") {
        clearInterval(timer);
      } else {
        timer = setInterval(() => {
          sendTimeStamp("/timeStamp", userInfo);
        }, 3000);
      }
    });

    //监听页面关闭
    window.addEventListener("pagehide", () => {
      if (!isBack) {
        quitTime = formatDateTime(new Date());
        sendUserData(userInfo, startTime, quitTime);
      }
    });
  });
}
