class User {
  constructor(_id, _room, _name) {
    this.id = _id;
    this.room = _room;
    this.lag = 0;
    this.isHost = false;
  }
}
let user;
let playercnt;
let receive = ws => {
  ws.addEventListener("message", () => {
    let json = JSON.parse(event.data);
    switch (json.title) {
      case "welcome":
        //名前をIDに付与
        let urlParams = new URLSearchParams(window.location.search);
        let urlname=urlParams.get('name');
        if(urlname==null){
          urlname = "noname"
        }
        let username = `${urlname}#${json.user.id}`;
        user = new User(username, json.user.room, username);
        user.lag = new Date().getTime() - json.time;
        playercnt = json.playercnt - 1;
        let data = {
          protoId: json.user.id,
          sender: username,
          title: "setLag",
          lag: user.lag
        };
        ws.send(JSON.stringify(data));
        console.log(`LOGIN`);
        console.log(`USERID:${user.id}`);
        view();
        break;
      case "updateHost":
        user.isHost = true;
        view();
        console.log(`ISHOST`);
        break;
      case "loginuser":
        playercnt++;
        view();
        break;
      case "logoutuser":
        playercnt--;
        view();
        break;
    }
  });
  let view = () => {
    if (user.isHost) {
      document.getElementById(
        "name"
      ).innerHTML = `ID:<strong>${user.id}</strong>👑`;
    } else {
      document.getElementById(
        "name"
      ).innerHTML = `ID:<strong>${user.id}</strong>`;
    }
    document.getElementById(
      "name"
    ).innerHTML += `<font size="3" color="#c0c0c0"> ${playercnt} watching now</font>`;
  };
};
export { user, receive };
