import 'regenerator-runtime/runtime'
import React from 'react'
import UI from './ui'

function onRoomEnter () {
  this.inDaChat = true
}

function onRoomExit () {
  this.inDaChat = false
}

function onStreamChanged (data) {
  this.videoStream = new MediaStream(data.stream.getVideoTracks())
}

XROOM_PLUGIN({
  inDaChat: false,
  scriptRef: null,
  videoStream: null,

  translations: {
    en: {
      iconCaption: 'Pulse',
      useHint: 'Press "start" and put your finger on the camera. Make sure you are in a well lit environment.',
      btnStart: 'Start',
      btnClose: 'Close',
      btnTorch: 'Torch',
      noCamera: 'It looks like all the cameras are blocked',
      cameraFallback: 'No rear camera found. Falling back to the front camera.',
    },
    sv: {
      iconCaption: 'Puls',
      useHint: 'Tryck på "starta" och lägg ett finger på kameran. Se till att du befinner dig i en väl upplyst omgivning.',
      btnStart: 'Starta',
      btnClose: 'Stäng',
      btnTorch: 'Lampa',
      noCamera: 'Det känns som ingen kamera är tillgänglig',
      cameraFallback: 'No rear camera found. Falling back to the front camera.',
    },
    ru: {
      iconCaption: 'Пульс',
      useHint: 'Нажмите "начать" и слегка прижмите палец к камере',
      btnStart: 'Начать',
      btnClose: 'Закрыть',
      btnTorch: 'Свет',
      noCamera: 'Похоже, ни одна камера не доступна.',
      cameraFallback: 'No rear camera found. Falling back to the front camera.',
    },
  },

  events: {
    'ss/onJoin': onRoomEnter,
    'room/exit': onRoomExit,
    'localStream/changed': onStreamChanged,
  },

  register () {
    this.api('appendScript', {src: 'https://webrtchacks.github.io/adapter/adapter-latest.js'}).then(async (id) => {
      const [ sysStream ] = await this.api('getLocalStream')

      if (!this.videoStream && sysStream) {
        this.videoStream = new MediaStream(sysStream.getVideoTracks())
      }

      this.scriptRef = id

      this.api('addUI', { component:
          <UI
            ui={this.uiLibrary}
            i18n={this.i18n}
            mbox={this.mbox}
            ref={(ref) => { this.ui = ref} }
            inDaChat={() => this.inDaChat}
            getSystemStream={() => this.videoStream}
          />
      })

      this.addIcon()
    })
  },

  unregister () {
    this.api('removeIcon')
    this.api('removeElement', this.scriptRef)
  },

  isSupported () {
    return window.navigator.mediaDevices && window.navigator.mediaDevices.getUserMedia
  },

  addIcon () {
    this.api('addIcon', {
      title: () => this.i18n.t('iconCaption'),
      onClick: () => this.ui.toggle(),
      svg: props =>
        <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24">
          <path fill={props.color || '#000'} d="M7.5,4A5.5,5.5 0 0,0 2,9.5C2,10 2.09,10.5 2.22,11H6.3L7.57,7.63C7.87,6.83 9.05,6.75 9.43,7.63L11.5,13L12.09,11.58C12.22,11.25 12.57,11 13,11H21.78C21.91,10.5 22,10 22,9.5A5.5,5.5 0 0,0 16.5,4C14.64,4 13,4.93 12,6.34C11,4.93 9.36,4 7.5,4V4M3,12.5A1,1 0 0,0 2,13.5A1,1 0 0,0 3,14.5H5.44L11,20C12,20.9 12,20.9 13,20L18.56,14.5H21A1,1 0 0,0 22,13.5A1,1 0 0,0 21,12.5H13.4L12.47,14.8C12.07,15.81 10.92,15.67 10.55,14.83L8.5,9.5L7.54,11.83C7.39,12.21 7.05,12.5 6.6,12.5H3Z" />
        </svg>
    })
  }
})
