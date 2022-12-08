import youtubePlayer from "youtube-player";
let startTime=0;
let pauseTime=0;
// Cannot access YT.PlayerState from youtube-player (?), so declare constant here.
const PlayerState = {
  UNSTARTED: -1,
  ENDED: 0,
  PLAYING: 1,
  PAUSED: 2,
  BUFFERING: 3,
  CUED: 5,
};
const IntroState = {
  MUTE: 0,
  PLAYING: 1,
  CUED: 2,
  INTRO: 3,
};
let player = {
  youtube: youtubePlayer("player", {
    height: "390",
    width: "640",
    videoId: "xkMdLcB_vNU",
    playerVars: {
      disablekb: 1,
      playsinline: 1,
    },
  }),
};
document.getElementById("volume").addEventListener("change", setvol, false);
document.getElementById("volume").addEventListener("input", setvol, false);
player.youtube.getVolume().then((value) => {
  setvol(1);
});
function setvol() {
  player.youtube.setVolume(document.getElementById("volume").value);
}
let startPauseTime = 0;
let state = IntroState.MUTE;
const readyEvent = new Event("playerReady");
player.youtube.on("stateChange", (event) => {
  //console.log(event.data);
  switch (state) {
    case IntroState.MUTE:
      if (event.data == PlayerState.PLAYING) {
        player.youtube.pauseVideo();
      }
      break;
    case IntroState.PLAYING:
      if (event.data == PlayerState.PAUSED) {
        syncStart();
      }
      if (event.data == PlayerState.ENDED) {
        ableStateChange(IntroState.MUTE);
      }
      break;
    case IntroState.INTRO:
      if (event.data == PlayerState.PAUSED) {
        startPauseTime = new Date().getTime();
      }
      if (event.data == PlayerState.ENDED) {
        pauseTime=0;
        ableStateChange(IntroState.MUTE);
      }
      break
  }
});
let syncStart = () =>{
  pauseTime += new Date().getTime() - startPauseTime;
  let currentTime = new Date().getTime();
  let statussec = (currentTime - startTime - pauseTime) / 1000;
  player.youtube.seekTo(statussec, true);
  player.youtube.playVideo();
}
let ableStateChange = (states) => {
  state = states;
};
let setpauseTime = (time)=>{
  pauseTime = time;
}
let getpauseTime = ()=>{
  return pauseTime
}
function startPlayer(time,_pausetime,_startPauseTime) {
  startTime = time;
  pauseTime = _pausetime;
  startPauseTime = _startPauseTime;
  console.log("unmute");
  player.youtube.unMute();
  player.youtube.playVideo();
}
export { player, ableStateChange, IntroState, PlayerState, state, startPlayer,syncStart,getpauseTime};
