let messaging;

(async () => {
  console.log('init')

  const [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true
  })

  console.log(tab)

  chrome.scripting.executeScript({
    target: {
      tabId: tab.id,
      allFrames: true
    },
    function: func
  }, () => {
    chrome.runtime.onConnect.addListener(port => messaging = port)
  })
})()

function func() {
  console.log('worked', document)

  //chrome.webNavigation.getAllFrames

  const videoObj = document.getElementById('lx-player_html5_api')
    || document.getElementById('kollus_player_html5_api')

  const port = chrome.runtime.connect()

  port.onMessage.addListener(obj => {
    console.log(obj)
    if (obj.cmd === 'rate') {
      videoObj.playbackRate = obj.data
    }
  })
}

const range = document.getElementById('rateRange')
const input = document.getElementById('rateInput')
const rateApplyBtn = document.getElementById('rateApply')

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