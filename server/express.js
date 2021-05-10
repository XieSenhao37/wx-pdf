const express = require("express");
//解析formdata用的
const multipart = require("connect-multiparty");
const cors = require("cors");
const axios = require("axios");
const sha1 = require("sha1");
const fs = require("fs");
const app = express();
const port = 8000;
const appid = "wx0e1b4f2fef3bfddd";
const secret = "c408f89269509cf4b772478a52bb6df4";
const multipartMiddleware = multipart();
const userdata = require("./db/models").userdata;

app.use(cors());
//解析post请求
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/customize", (req, res) => {
  axios
    .get("https://api.weixin.qq.com/cgi-bin/token", {
      params: {
        grant_type: "client_credential",
        appid,
        secret,
      },
    })
    .then((token) => {
      let { access_token } = token.data;
      axios
        .get("https://api.weixin.qq.com/cgi-bin/ticket/getticket", {
          params: {
            type: "jsapi",
            access_token,
          },
        })
        .then((jsapi_ticket) => {
          let { ticket } = jsapi_ticket.data;
          let timestamp = new Date().getTime();
          let $chars = "ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678";
          let maxPos = $chars.length;
          let nonceStr = "";
          for (let i = 0; i < 10; i++) {
            nonceStr += $chars.charAt(Math.floor(Math.random() * maxPos));
          }
          const string1 =
            "jsapi_ticket=" +
            ticket +
            "&noncestr=" +
            nonceStr +
            "&timestamp=" +
            timestamp +
            "&url=" +
            decodeURIComponent(req.query.url);
          const signature = sha1(string1);
          res.send({
            appid,
            nonceStr,
            timestamp,
            signature,
          });
        })
        .catch((err) => {
          console.log("请求ticket出错！");
          console.log(err);
        });
    })
    .catch((err) => {
      console.log("请求token出错！");
      console.log(err);
    });
});
app.get("/userinfo", (req, res) => {
  axios
    .get("https://api.weixin.qq.com/sns/oauth2/access_token", {
      params: {
        appid,
        secret,
        code: req.query.code,
        grant_type: "authorization_code",
      },
    })
    .then((token) => {
      let { access_token, openid } = token.data;
      axios
        .get("https://api.weixin.qq.com/sns/userinfo", {
          params: {
            access_token,
            openid,
            lang: "zh_CN",
          },
        })
        .then((userinfo) => {
          fs.open("./userinfo.txt", "a", function (err, fd) {
            // 判断是否出错
            if (!err) {
              // 如何没有出错，则对文件执行写入操作
              fs.write(
                fd,
                JSON.stringify(userinfo.data) + "\n",
                function (err) {
                  if (!err) {
                    console.log("成功写入一条用户信息");
                  }
                  fs.close(fd, function (err) {
                    if (!err) {
                      console.log("文件已关闭~~~");
                    }
                  });
                }
              );
            } else {
              console.log(err);
            }
          });
        });
    });
});

app.get("/startTime", (req, res) => {
  let str = `用户访问开始时间：${req.query.startTime}\n`;
  fs.open("./userinfo.txt", "a", function (err, fd) {
    // 判断是否出错
    if (!err) {
      // 如何没有出错，则对文件执行写入操作
      fs.write(fd, str, function (err) {
        if (!err) {
          console.log("成功写入用户访问开始时间");
        }
        fs.close(fd, function (err) {
          if (!err) {
            console.log("文件已关闭");
          }
        });
      });
    } else {
      console.log(err);
    }
    res.send("ok");
  });
});

app.post("/quitTime", (req, res) => {
  let data = "";
  req.on("data", function (chunk) {
    data += chunk;
  });
  req.on("end", function () {
    let str = `用户访问结束时间：${data}\n\n`;
    fs.open("./userinfo.txt", "a", function (err, fd) {
      // 判断是否出错
      if (!err) {
        // 如何没有出错，则对文件执行写入操作
        fs.write(fd, str, function (err) {
          if (!err) {
            console.log("成功写入用户访问结束时间");
          }
          fs.close(fd, function (err) {
            if (!err) {
              console.log("文件已关闭");
            }
          });
        });
      } else {
        console.log(err);
      }
      res.send("ok");
    });
  });
});

app.post("/userData", multipartMiddleware, (req) => {
  axios
    .get("https://api.weixin.qq.com/sns/oauth2/access_token", {
      params: {
        appid,
        secret,
        code: req.body.code,
        grant_type: "authorization_code",
      },
    })
    .then((token) => {
      let { access_token, openid } = token.data;
      axios
        .get("https://api.weixin.qq.com/sns/userinfo", {
          params: {
            access_token,
            openid,
            lang: "zh_CN",
          },
        })
        .then((userinfo) => {
          fs.open("./userdata.txt", "a", function (err, fd) {
            // 判断是否出错
            if (!err) {
              // 如何没有出错，则对文件执行写入操作
              let userdata = userinfo.data;
              userdata.starttime = req.body.startTime;
              userdata.quittime = req.body.quitTime;
              fs.write(fd, JSON.stringify(userdata) + "\n\n", function (err) {
                if (!err) {
                  console.log("成功写入一条用户数据");
                }
                fs.close(fd, function (err) {
                  if (!err) {
                    console.log("文件已关闭~~~");
                  }
                });
              });
            } else {
              console.log(err);
            }
          });
        });
    });
});

app.get("/visitData", (req, res) => {
  fs.open("./userdata.txt", "a", function (err, fd) {
    // 判断是否出错
    if (!err) {
      fs.write(fd, JSON.stringify(req.header) + "\n\n", function (err) {
        if (!err) {
          console.log("成功写入一条请求数据");
        }
        fs.close(fd, function (err) {
          if (!err) {
            console.log("文件已关闭~~~");
          }
        });
      });
    } else {
      console.log(err);
    }
  });
});

app.listen(port, () => {
  console.log(`服务器启动完成`);
});
