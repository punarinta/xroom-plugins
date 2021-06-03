import 'regenerator-runtime/runtime'
import UI from './ui'
import * as React from 'preact'

async function onRoomEnter (props) {
  // console.log('onRoomEnter props', props);
  this.inDaChat = true
  if (this.ui) {
    this.ui.roomId = props.roomId
    this.ui.listPeers(await xroom.api('listPeers'))
  }
}

async function addId (id) {
  if (this.ui) {
    this.ui.addId(id)
  }
}

function onRoomExit () {
  this.inDaChat = false
}

async function onPeersChanged (props) {
  // console.log('onPeersChanged props', props);
  if (this.ui) {
    this.ui.listPeers(await xroom.api('listPeers'))
  }
}

function onDataIn (data) {
  // console.log('onDataIn', data)
  if (this.ui) {
    this.ui.receiveState(data)
  }
}

xroom.plugin = {
  inDaChat: false,

  events: {
    'ss/onJoin': onRoomEnter,
    // 'ss/onReadRoom': onReadRoom,
    'ss/addId': addId,
    'room/exit': onRoomExit,
    'peer/added': onPeersChanged,
    'peer/removed': onPeersChanged,
    'peer/card': onPeersChanged,
    'data/in': onDataIn,
  },

  translations: {
    en: {
      iconCaption: 'Manage',
      header: 'Breakout Rooms',
      btnSplitRoom: 'Split room',
      btnConfirmSplitRoom: 'Send invites',
      btnCancelSplitRoom: 'Cancel',
      splitOn: 'on',
      robots: 'Robots',
      humans: 'Humans',
      unassigned: 'Unassigned Participants',
      noUnassigned: 'All participants have been assigned to different rooms.',
      number: 'Number of rooms',
      you: 'You',
      breakRoomOffer: 'Your breakout room:',
      mbox: {
        enterFirst: 'Enter the room first',
        tooFewPeople: 'Too few people in the room',
      },
    },
    ru: {
      iconCaption: 'Комната',
      header: 'Брейкаут комнаты',
      btnSplitRoom: 'Разбить комнату',
      btnConfirmSplitRoom: 'Разослать приглашения',
      btnCancelSplitRoom: 'Отмена',
      splitOn: 'на',
      robots: 'Роботы',
      humans: 'Люди',
      unassigned: 'Свободные участники',
      noUnassigned: 'Все участники были назначены в другие комнаты.',
      number: 'Количество комнат',
      you: 'Вы',
      breakRoomOffer: 'Ваша брейкаут-комната:',
      mbox: {
        enterFirst: 'Сначала войдите в комнату',
        tooFewPeople: 'Недостаточно людей в комнате',
      },
    },
  },

  async register (props) {
    await xroom.api('addUI', { component:
      <UI
        api={xroom.api}
        ui={xroom.ui}
        mbox={xroom.mbox}
        i18n={xroom.i18n}
        ref={(ref) => { this.ui = ref } }
      />
    })
    await new Promise(resolve => setTimeout(resolve, 100))

    console.log('register props', props);
    if (props.roomId) {
      this.inDaChat = true
      if (this.ui) {
        this.ui.roomId = props.roomId
      }
    }
    if (this.ui) {
      const peerList = await xroom.api('listPeers')
      this.ui.listPeers(peerList)
    }

    this.addIcon()
  },

  unregister () {
    xroom.api('removeIcon')
  },

  addIcon () {
    xroom.api('addIcon', {
      title: () => xroom.i18n.t('iconCaption'),
      onClick: () => {
        if (this.inDaChat) {
          this.ui.open()
        } else {
          xroom.mbox({text: xroom.i18n.t('mbox.enterFirst')})
        }
      },
      svg: ({size, color, blink}) => 
        <svg width={size || 25} height={size || 25} fill="none" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <path d="M93 37.1c-1-1-6.2-1.2-9.6-1.3h-2.2c-2.7 0-3.9 2.8-4 3.9l-2 7.3-.4-.4-.3-.4c.7-2.3 1.6-5.4 1.8-6.7.2-1.2 1.6-4.5 4.9-4.5h1.6c.3-1.8 0-3.1-.9-4-.7-.6-3.6-1-8.7-1h-1c-2.2 0-3 2.2-3.2 3l-1.3 4.5-.3-.4-.3-.4c.4-1.4 1-3 1.1-3.9.2-1 1.3-3.6 4-3.6h1.2c.3-1.5 0-2.6-.8-3.4-1-.8-6-1.3-7.9-1.3-1.9 0-2.7 1.8-2.8 2.6l-.8 3.1c-1-.4-2-.8-3.3-1v-5.6c0-2-3.3-3.6-7.4-3.6-4.1 0-7.4 1.6-7.4 3.6v5.5c-1.3.3-2.3.6-3.2 1l-.8-3c-.1-.8-1-2.6-2.8-2.6-1.8 0-6.9.5-7.9 1.3-.8.8-1 2-.8 3.4h1.3c2.6 0 3.7 2.6 4 3.6 0 .9.6 2.4 1 3.8l-.3.4-.3.4-1.3-4.4c-.1-.8-1-3-3.1-3h-1c-5.2 0-8.1.4-8.8 1-1 .8-1.2 2.2-.8 4h1.5c3.3 0 4.7 3.3 5 4.5.2 1.3 1 4.3 1.7 6.6l-.3.4-.4.4a116 116 0 01-1.9-7.2c-.2-1-1.3-3.9-4-3.9h-1.5-.8c-3.4 0-8.5.3-9.6 1.3-1.4 1.3-1.7 3.6-.8 6.4A368 368 0 0111.5 65s1 2 6.5 2.9v6l-5.3-2a1 1 0 00-1.3.5c-.1.4 0 .8.2 1l-.2.7c0 .7.5 1.2 1.1 1.2.6 0 1-.4 1.2-1l3 1.3-4.7 1.9a1 1 0 00-.6 1.3l.1.2-.1.6a1.2 1.2 0 102.2-.6l5.8-2.3 5.8 2.3-.1.3a1.2 1.2 0 102.3 0v-.4-.1a1 1 0 00-.5-1.3L22 75.5l3.2-1.3c.2.3.6.5 1 .5a1.2 1.2 0 001-1.6 1 1 0 00-1.3-1.4L21 74V68h.6l1 .5 1 .4c2.4 1 5.3 1.8 8.4 2.4 1.4 1 2.7 2.3 2.7 4.1V85s1.5 3.3 16.3 3.3C65.5 88.2 67 85 67 85v-9.4c0-1.6 1.2-3 2.5-3.9C73.1 71 76.4 70 79 69h.4v4.9L74 71.7a1 1 0 00-1.3.6c-.2.4-.1.8.1 1l-.2.7c0 .7.5 1.2 1.2 1.2.5 0 1-.4 1.1-1l3 1.3-4.7 1.9a1 1 0 00-.5 1.3v.2l-.1.6a1.2 1.2 0 102.2-.6l5.9-2.3 5.7 2.3v.3a1.2 1.2 0 102.3 0l-.1-.4v-.1a1 1 0 00-.5-1.3l-4.7-1.9 3.2-1.3c.2.3.5.5.9.5a1.2 1.2 0 001.1-1.6 1 1 0 00-1.3-1.4L82.2 74v-6c6.3-.9 7.3-3 7.4-3 0-.7 3.2-17.7 4.3-21.4 1-2.8.6-5-.8-6.4zM82.2 59.8v.2C80.7 63 66 67 50.3 67c-16 0-30-4.6-31.3-7.5v-.2c-.1 0-.1-.2 0-.2V59l.2-.4 6-7.5 1.8-2.4 5.6-7 2-2.6 4.5-5.8c1-1.2 3.8-2.6 11.2-2.6 6 0 9.7.9 11.1 2.5l4.7 6 1.3 1.7 6.3 8 1.4 1.7 6.3 8 .1.2c.6.5.6.8.6 1z" fill={ color } />
        </svg>
    })
  },

  isSupported () {
    return true
  },

}