import select from 'select-dom'
import copyToClipboard from 'copy-text-to-clipboard'
import browser from 'webextension-polyfill'
import storage from '../../libs/storage'
import { getTeamElements, getRoomId } from '../libs/match-room'

const store = new Map()

export default async parent => {
  const { isTeamV1Element } = getTeamElements(parent)
  let serverConnectData

  if (isTeamV1Element) {
    const element = select('div[ng-if="serverConnectData.active"] span', parent)
    serverConnectData = element && element.textContent
  } else {
    const element = select(
      'input[ng-model="vm.currentMatch.derived.serverConnectData.clipboard.text"]',
      parent
    )
    serverConnectData = element && element.value
  }

  if (!serverConnectData) {
    return
  }

  const roomId = getRoomId()

  if (store.has(roomId)) {
    return
  }

  store.set(roomId, true)

  copyToClipboard(serverConnectData)

  const { notifyMatchRoomAutoConnectToServer } = await storage.getAll()

  if (notifyMatchRoomAutoConnectToServer) {
    browser.runtime.sendMessage({
      action: 'notification',
      title: 'Ready to Connect',
      message: 'Server connect data has been copied to your clipboard.'
    })
  }
}
