import { user, receive } from "./userClient";
import { ws, send } from "./websoket";
import { playse } from "./se";
import {
  getStorage,
  setStorage,
} from "./storage";
import {
  player,
  ableStateChange,
  IntroState,
  PlayerState,
  syncStart,
  getpauseTime,
} from "./player";
let playerHost = false;
let hostid = -1;
let isPause = false;
let isVisible = false;
const pauseb = document.getElementById("pauseBtn");
const inv = document.getElementById("invBtn");
const pp = document.getElementById("players");
const mes = document.getElementById("messages");
const pauser = document.getElementById('pauser');
const cs = document.createElement('canvas');
const ctx = cs.getContext('2d');
const skip = document.getElementById("startbtn");

skip.addEventListener("click", skipVideo, false);
cs.height = '390';
cs.width = '640';
ctx.fillStyle = 'white';
ctx.fillRect(0, 0, 1000, 1000);
pp.appendChild(cs);

function render(sender) {
  pauser.innerHTML = "出題者:" + hostid + "　回答者：" + sender;
  skip.value = "正解";
  if(playerHost){
    pauseb.value = "不正解";
  }
}
function intropause(sender) {
  if (isPause != getStorage("introStats")[0].isPause) {
    isPause = false;
  }
  if (!isPause) {
    playse("se/buzer.mp3");
    isPause = true;
    if (playerHost) {
      let store = {
        video: getStorage("introStats")[0].video,
        pauseTime: getStorage("introStats")[0].pauseTime,
        startPauseTime: new Date().getTime(),
        anser: sender,
        isPause: true,
        inv: getStorage("introStats")[0].inv
      };
      setStorage("introStats", store);
    }
    render(sender);
    ableStateChange(IntroState.INTRO);
    player.youtube.pauseVideo();
  }
}
function invisible(invisibleStat) {
  isVisible = invisibleStat;
  if (!invisibleStat) {
    if (playerHost) {
      pp.style.opacity = 0.7;
    } else {
      pp.style.opacity = 1;
    }
    pp.style.display = 'block';
  } else {
    pp.style.opacity = 0.01;
    pp.style.display = 'block';
  }
  if (user.isHost) {
    let store = {
      video: getStorage("introStats")[0].video,
      pauseTime: getStorage("introStats")[0].pauseTime,
      anser: getStorage("introStats")[0].anser,
      isPause: getStorage("introStats")[0].isPause,
      inv: invisibleStat
    };
    setStorage("introStats", store);
  }
}
function sethost(host) {
  console.log(user.id);
  if (host == user.id) {
    playerHost = true
  } else {
    playerHost = false;
  }
  hostid = host;
  pauser.innerHTML = "出題者:" + hostid;
}
function introDef() {
  inv.addEventListener("click", () => {
    if (playerHost) {
      let data = {
        sender: user.id,
        inv: !isVisible,
        title: "inv",
      };
      send(data);
    }
  });
  pauseb.addEventListener("click", () => {
    isPause = getStorage("introStats")[0].isPause;
    if (isPause) {
      if (playerHost) {
        let data = {
          sender: user.id,
          playse: true,
          title: "pauseEnd",
        };
        send(data);
      }
    } else {
      let data = {
        sender: user.id,
        title: "pause",
      };
      send(data);
    }
  }, false);
}
let receiveIntro = ws => {
  ws.addEventListener("message", (e) => {
    let json = JSON.parse(e.data);
    switch (json.title) {
      case "pause":
        intropause(json.sender);
        break;
      case "inv":
        invisible(json.inv);
        break;
      case "pinpon":
        skip.style.visibility = "hidden";
        invisible(true);
        if (json.isPause) {
          playse("se/pinpon.mp3");
        }
        isPause = getStorage("introStats")[0].isPause;
        if (isPause) {
          if (playerHost) {
            let data = {
              sender: user.id,
              playse: false,
              title: "pauseEnd",
            };
            send(data);
          }
        }
        sleep(10, function () {
          let data = {
            sender: user.id,
            title: "nextQuiz",
          };
          send(data);
        });
        break;
      case "pauseEnd":
        syncStart();
        if (user.isHost) {
          let store = {
            video: getStorage("introStats")[0].video,
            pauseTime: getpauseTime(),
            anser: null,
            isPause: false,
            inv: getStorage("introStats")[0].inv
          };
          setStorage("introStats", store);
        }
        if (json.playse) {
          playse("se/wrong.mp3");
          pauseb.value="回答";
        }
        skip.value = "正解者無し(次の問題へ)";
        isPause = false;
        pauser.innerHTML = "出題者:" + hostid
        break;
    }
  });
}
function skipVideo() {
  isPause = getStorage("introStats")[0].isPause;
  if (user.id != getStorage("serverstats")[0].video.pid) {
    isPause = false;
  }
  let data = {
    sender: user.id,
    isPause: isPause,
    title: "pinpon",
  };
  send(data);
}

function sleep(waitSec, callbackFunc) {

  // 経過時間（秒）
  var spanedSec = waitSec;
  // 1秒間隔で無名関数を実行
  var id = setInterval(function () {
    spanedSec--;
    // 経過時間 >= 待機時間の場合、待機終了。
    document.getElementById(
      "systemWindow"
    ).innerHTML = `次の問題まで${spanedSec}秒`;
    if (spanedSec == 0) {
      // タイマー停止
      clearInterval(id);
      document.getElementById(
        "systemWindow"
      ).innerHTML = ``;
      // 完了時、コールバック関数を実行
      if (callbackFunc) callbackFunc();
    }
  }, 1000);

}

export { introDef, receiveIntro, sethost, invisible, intropause, ctx };