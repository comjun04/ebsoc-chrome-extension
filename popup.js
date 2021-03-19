let messaging
const URL_FILTER = /^https:\/\/taj\.ebsoc\.co\.kr+/

// Elements
const mainArea = document.getElementById('main')
const playerNotFoundArea = document.getElementById('playerNotFound')
const notInWebsiteArea = document.getElementById('notInWebsite')

const range = document.getElementById('rateRange')
const input = document.getElementById('rateInput')
const rateApplyBtn = document.getElementById('rateApply')

const playBtn = document.getElementById('play')
const pauseBtn = document.getElementById('pause')

const back10sBtn = document.getElementById('back10s')
const back5sBtn = document.getElementById('back5s')
const front5sBtn = document.getElementById('front5s')
const front10sBtn = document.getElementById('front10s')

const seekInput = document.getElementById('seekInput')
const seekRewBtn = document.getElementById('seekRew')
const seekFwdBtn = document.getElementById('seekFwd')

;
(async () => {
  console.log('init')

  // get current tab
  const [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true
  })
  console.log(tab)

  // exit when not in vail url
  if (!URL_FILTER.test(tab.url)) {
    mainArea.classList.add('hidden')
    notInWebsiteArea.classList.remove('hidden')
    return
  }

  // run web context first
  const isVideoAvailable = await runWebCtxFn(tab.id)
  if (!isVideoAvailable) {
    mainArea.classList.add('hidden')
    playerNotFoundArea.classList.remove('hidden')
    return
  }

  // and then setup the extension ui and events.
  mainInit()
})()

function mainInit() {
  chrome.runtime.onConnect.addListener(messaging => {
    // register event listener
    range.addEventListener('input', () => {
      input.value = range.value
    })

    rateApplyBtn.addEventListener('click', () => {
      const val = range.value
      messaging.postMessage({
        cmd: 'rate',
        data: val
      }, () => {
        console.log('send ok')
      })
    })

    const seek = (seconds) => {
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

    // Seek input
    const getSeekInputValue = () => {
      const val = Number(seekInput.value)
      const val2 = isNaN(val) ? 0 : val
      return val2
    }

    seekRewBtn.addEventListener('click', () => {
      const val = getSeekInputValue()
      seek(val * -1)
    })

    seekFwdBtn.addEventListener('click', () => {
      const val = getSeekInputValue()
      seek(val)
    })
  })
}

function runWebCtxFn(tabId) {
  return new Promise((resolve, reject) => {
    chrome.scripting.executeScript({
      target: {
        tabId,
        allFrames: true
      },
      function: willRunInWeb
    }, (frameResults) => {
      console.log('document script run complete', frameResults)

      const results = frameResults.map(a => a.result)
      resolve(results.includes(true))
    })
  })
}

/**
 * the code which will run in web context.
 */
function willRunInWeb() {
  console.log('web context run start')

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

  // setup message handler
  if (videoObj) {
    console.log('video obj true')
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

    return true
  } else return false
}