import { user, receive } from "./userClient";
import { ws, send } from "./websoket";
import {
    player,
    ableStateChange,
    IntroState,
    PlayerState,
    state,
    startPlayer,
  } from "./player";
  let playerHost = false;
  let hostid = -1;
  let isPause = false;
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
  function pause() {
    if(!isPause){
      isPause=true;
      ableStateChange(IntroState.INTRO);
      player.youtube.getPlayerState().then((event)=>{
        console.log(event);
        if(event==PlayerState.PAUSED){
          player.youtube.playVideo();
        }else{
          player.youtube.pauseVideo();
        }
      })
    } 
  }
  function invisible(onoff) {
    if(!onoff){
      pp.style.opacity= 1;
      pp.style.display= 'block';
      mes.style.display = 'none';
    }else{
      pp.style.display= 'none';
      mes.style.display = 'block';
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
  function def(){
    console.log("onintro")
    /*
    inv.addEventListener("click", ()=>{
      let data = {
        sender: user.id,
        title: "inv",
      };
      send(data);
    }, false);
    */
    pauseb.addEventListener("click", ()=>{
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
      console.log(json.title);
      switch (json.title) {
        case "pause":
          pauser.innerHTML = "出題者:"+hostid + "　回答者："+json.sender;
          console.log(json.sender)
          pause();
          break;
        case "inv":
          invisible(false);
          break;
        case "pauseEnd":
          isPause=false;
          pauser.innerHTML = "出題者:"+hostid
          player.youtube.playVideo();
          break;
      }
    });
  }
  export {def,receiveIntro,sethost };