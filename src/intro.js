import { user, receive } from "./userClient";
import { ws, send } from "./websoket";
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
  cs.height = '390';
  cs.width = '640';
  ctx.fillStyle = 'white';
  ctx.fillRect(0,0,1000,1000);
  pp.appendChild(cs);
  invisible(false);
  function render(sender){
    pauser.innerHTML = "出題者:"+hostid + "　回答者："+sender;
  }
  function intropause(sender) {
    isPause = getStorage("introStats")[0].isPause;
    if(!isPause){
      isPause=true;
      if(playerHost){
        let store = {
          video: getStorage("introStats")[0].video,
          pauseTime: getStorage("introStats")[0].pauseTime,
          anser:sender,
          isPause: true,
          inv:getStorage("introStats")[0].inv
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
    if(!invisibleStat){
      if(playerHost){
        pp.style.opacity= 0.7;
      }else{
        pp.style.opacity= 1;
      }
      pp.style.display= 'block';
    }else{
      pp.style.opacity= 0.01;
      pp.style.display= 'block';
    }
    if(playerHost){
      let store = {
        video: getStorage("introStats")[0].video,
        pauseTime: getStorage("introStats")[0].pauseTime,
        anser:getStorage("introStats")[0].anser,
        isPause: getStorage("introStats")[0].isPause,
        inv:invisibleStat
      };
      setStorage("introStats", store);
    }
  }
  function sethost(host){
    console.log(user.id);
    if(host==user.id){
      playerHost = true
    }else{
      playerHost = false;
    }
    hostid = host;
    pauser.innerHTML = "出題者:"+hostid;
  }
  function introDef(){
    inv.addEventListener("click", ()=>{
      if(playerHost){
        let data = {
          sender: user.id,
          inv: !isVisible,
          title: "inv",
        };
        send(data);
      }
    });
    pauseb.addEventListener("click", ()=>{
      isPause = getStorage("introStats")[0].isPause;
      if(isPause){
        if(playerHost){
          let data = {
            sender: user.id,
            title: "pauseEnd",
          };
          send(data);
        }
      }else{
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
        case "pauseEnd":
          syncStart();
          if(playerHost){
            let store = {
              video: getStorage("introStats")[0].video,
              pauseTime: getpauseTime(),
              anser:null,
              isPause: false,
              inv:getStorage("introStats")[0].inv
            };
            setStorage("introStats", store);
          }
          isPause=false;
          pauser.innerHTML = "出題者:"+hostid
          break;
      }
    });
  }
  export {introDef,receiveIntro,sethost,invisible,intropause };