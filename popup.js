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
      if (obj.cmd === 'rate') {
        videoObj.playbackRate = obj.data
      } else if (obj.cmd === 'seek') {
        videoObj.currentTime += obj.data
      }
    })
  }
}

const range = document.getElementById('rateRange')
const input = document.getElementById('rateInput')
const rateApplyBtn = document.getElementById('rateApply')
const back10sBtn = document.getElementById('back10s')
const back5sBtn = document.getElementById('back5s')
const front5sBtn = document.getElementById('front5s')
const front10sBtn = document.getElementById('front10s')

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