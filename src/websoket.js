let host = window.document.location.host.replace(/:.*/, "");
let ws = new WebSocket("wss://" + host + ":3002");
let send = mes => {
  ws.send(JSON.stringify(mes));
};
let recMes = () => {
  ws.on("message", function(message) {
    return JSON.parse(event.data);
  });
};
export { send, ws, recMes };
