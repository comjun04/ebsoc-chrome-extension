let messaging;

(async () => {
  console.log('init')

  const [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true
  })

  console.log(tab)

  chrome.runtime.onConnect.addListener(port => messaging = port)
  chrome.scripting.executeScript({
    target: {
      tabId: tab.id,
      allFrames: true
    },
    function: func
  }, () => {
    console.log('func done')
  })
})()

function func() {
  console.log('worked', document)

  // video 가져오기
  let videoObj = document.getElementById('lx-player_html5_api') ||
    document.getElementById('kollus_player_html5_api')
  if (!videoObj) {
    // 유튜브 영상일 경우 태그 이름으로 추출
    const list = document.getElementsByTagName('video')
    for (const i of list) {
      if (i != null) {
        videoObj = i
        break
      }
    }
  }
  console.log('video object', videoObj)

  if (videoObj) {
    const port = chrome.runtime.connect()

    port.onMessage.addListener(obj => {
      console.log(obj)

      switch (obj.cmd) {
        case 'rate':
          videoObj.playbackRate = obj.data
          break

        case 'seek':
          videoObj.currentTime += obj.data
          break
        
        case 'play':
          videoObj.play()
          break
        
        case 'pause':
          videoObj.pause()
          break
      }
    })
  }
}

// Elements
const range = document.getElementById('rateRange')
const input = document.getElementById('rateInput')
const rateApplyBtn = document.getElementById('rateApply')

const back10sBtn = document.getElementById('back10s')
const back5sBtn = document.getElementById('back5s')
const front5sBtn = document.getElementById('front5s')
const front10sBtn = document.getElementById('front10s')

const playBtn = document.getElementById('play')
const pauseBtn = document.getElementById('pause')

range.addEventListener('input', () => {
  input.value = range.value
})

rateApplyBtn.addEventListener('click', () => {
  console.log('rate')
  const val = range.value
  messaging.postMessage({
    cmd: 'rate',
    data: val
  }, () => {
    console.log('send ok')
  })
})

// seeking
function seek(seconds) {
  messaging.postMessage({
    cmd: 'seek',
    data: seconds
  })
}

back10sBtn.addEventListener('click', () => seek(-10))
back5sBtn.addEventListener('click', () => seek(-5))
front5sBtn.addEventListener('click', () => seek(5))
front10sBtn.addEventListener('click', () => seek(10))

playBtn.addEventListener('click', () => {
  messaging.postMessage({
    cmd: 'play'
  })
})
pauseBtn.addEventListener('click', () => {
  messaging.postMessage({
    cmd: 'pause'
  })
})