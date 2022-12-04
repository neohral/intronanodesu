const context = new AudioContext();
const gainNode = context.createGain();
gainNode.gain.value = 0.05;
gainNode.connect(context.destination);


let playse = async (filename) => {
    const buffer = await loadSound(filename)
    playSound(buffer)
  }
const loadSound = (url) => {
    return new Promise((resolve) => {
        // リクエストの生成
        const request = new XMLHttpRequest()
        request.open('GET', url, true)
        request.responseType = 'arraybuffer'

        // 読み込み完了時に呼ばれる
        request.onload = () => {
            context.decodeAudioData(request.response, (buffer) => {
                resolve(buffer)
            })
        }
        request.send()
    })
}

// サウンドの再生
const playSound = (buffer) => {
    // Source
    const source = context.createBufferSource()
    source.buffer = buffer

    // Destination
    source.connect(gainNode)

    // Sourceの再生
    source.start(0)
}
export {playse};