import 'regenerator-runtime/runtime'
import React from 'react'
import UI from './ui'

const X_SIZE = 480

function onStreamChanged (data) {
  if (data.videoOn && this.tfLoaded) {
    this.videoStream = new MediaStream(data.stream.getVideoTracks())
    this.camLoaded = true
    this.prepare()

    if (this.stashedMode) {
      this.selectMode(this.stashedMode)
    }
  }

  if (!data.videoOn && !data.external) {
    this.paused = true
    this.stashedMode = this.mode
  }
}

XROOM_PLUGIN({
  ctx: null,
  net: null,
  videoStream: null,
  tfLoaded: false,
  camLoaded: false,
  outputStream: null,
  aspectRatio: 0.75,
  videoElem: null,
  canvasElem: null,
  bgPixels: null,
  paused: false,
  mode: 0,
  stashedMode: 0,

  translations: {
    en: {
      iconCaption: 'Background',
      modeNormal: 'As is',
      modeBlur: 'Blurred',
      modeColorPop: 'Color pop',
      modeImage: 'Image (demo)',
    },
    ru: {
      iconCaption: 'Фон',
      modeNormal: 'Как есть',
      modeBlur: 'Размытый',
      modeColorPop: '"Color pop"',
      modeImage: 'Картинка (demo)',
    },
  },

  events: {
    'localStream/changed': onStreamChanged,
  },

  async register () {
    this.api('addUI', {
      component: <UI
        ui={this.uiLibrary}
        api={this.api}
        mbox={this.mbox}
        i18n={this.i18n}
        ref={(ref) => { this.ui = ref} }
        onModeSelect={mode => this.selectMode(mode)}
      />
    })

    await this.api('appendScript', { src: 'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@1.2' })
    await this.api('appendScript', { src: 'https://cdn.jsdelivr.net/npm/@tensorflow-models/body-pix@2.0' })

    tf.enableProdMode()
    await tf.ready()

    this.tfLoaded = true

    const [ sysStream ] = await this.api('getLocalStream')

    if (!this.videoStream && sysStream) {
      this.videoStream = new MediaStream(sysStream.getVideoTracks())
      this.camLoaded = true
      this.prepare()
    }

    this.addIcon()
  },

  unregister () {
    this.api('removeIcon')

    if (this.mode) {
      this.api('setLocalVideo', {reset: true})
    }
  },

  isSupported () {
    return (
      window.navigator.mediaDevices &&
      window.navigator.mediaDevices.getUserMedia &&
      window.WebAssembly &&
      !window.matchMedia('(max-width: 480px)').matches && //to disable phones
      !!window.MediaRecorder && window.MediaRecorder.isTypeSupported('video/webm') //disable safari
    )
  },

  addIcon () {
    this.api('addIcon', {
      title: () => this.i18n.t('iconCaption'),
      onClick: () => this.ui.toggleShow(),
      svg: props =>
        <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24">
          <path fill={props.color || '#000'} d="M14,8.5A1.5,1.5 0 0,0 12.5,10A1.5,1.5 0 0,0 14,11.5A1.5,1.5 0 0,0 15.5,10A1.5,1.5 0 0,0 14,8.5M14,12.5A1.5,1.5 0 0,0 12.5,14A1.5,1.5 0 0,0 14,15.5A1.5,1.5 0 0,0 15.5,14A1.5,1.5 0 0,0 14,12.5M10,17A1,1 0 0,0 9,18A1,1 0 0,0 10,19A1,1 0 0,0 11,18A1,1 0 0,0 10,17M10,8.5A1.5,1.5 0 0,0 8.5,10A1.5,1.5 0 0,0 10,11.5A1.5,1.5 0 0,0 11.5,10A1.5,1.5 0 0,0 10,8.5M14,20.5A0.5,0.5 0 0,0 13.5,21A0.5,0.5 0 0,0 14,21.5A0.5,0.5 0 0,0 14.5,21A0.5,0.5 0 0,0 14,20.5M14,17A1,1 0 0,0 13,18A1,1 0 0,0 14,19A1,1 0 0,0 15,18A1,1 0 0,0 14,17M21,13.5A0.5,0.5 0 0,0 20.5,14A0.5,0.5 0 0,0 21,14.5A0.5,0.5 0 0,0 21.5,14A0.5,0.5 0 0,0 21,13.5M18,5A1,1 0 0,0 17,6A1,1 0 0,0 18,7A1,1 0 0,0 19,6A1,1 0 0,0 18,5M18,9A1,1 0 0,0 17,10A1,1 0 0,0 18,11A1,1 0 0,0 19,10A1,1 0 0,0 18,9M18,17A1,1 0 0,0 17,18A1,1 0 0,0 18,19A1,1 0 0,0 19,18A1,1 0 0,0 18,17M18,13A1,1 0 0,0 17,14A1,1 0 0,0 18,15A1,1 0 0,0 19,14A1,1 0 0,0 18,13M10,12.5A1.5,1.5 0 0,0 8.5,14A1.5,1.5 0 0,0 10,15.5A1.5,1.5 0 0,0 11.5,14A1.5,1.5 0 0,0 10,12.5M10,7A1,1 0 0,0 11,6A1,1 0 0,0 10,5A1,1 0 0,0 9,6A1,1 0 0,0 10,7M10,3.5A0.5,0.5 0 0,0 10.5,3A0.5,0.5 0 0,0 10,2.5A0.5,0.5 0 0,0 9.5,3A0.5,0.5 0 0,0 10,3.5M10,20.5A0.5,0.5 0 0,0 9.5,21A0.5,0.5 0 0,0 10,21.5A0.5,0.5 0 0,0 10.5,21A0.5,0.5 0 0,0 10,20.5M3,13.5A0.5,0.5 0 0,0 2.5,14A0.5,0.5 0 0,0 3,14.5A0.5,0.5 0 0,0 3.5,14A0.5,0.5 0 0,0 3,13.5M14,3.5A0.5,0.5 0 0,0 14.5,3A0.5,0.5 0 0,0 14,2.5A0.5,0.5 0 0,0 13.5,3A0.5,0.5 0 0,0 14,3.5M14,7A1,1 0 0,0 15,6A1,1 0 0,0 14,5A1,1 0 0,0 13,6A1,1 0 0,0 14,7M21,10.5A0.5,0.5 0 0,0 21.5,10A0.5,0.5 0 0,0 21,9.5A0.5,0.5 0 0,0 20.5,10A0.5,0.5 0 0,0 21,10.5M6,5A1,1 0 0,0 5,6A1,1 0 0,0 6,7A1,1 0 0,0 7,6A1,1 0 0,0 6,5M3,9.5A0.5,0.5 0 0,0 2.5,10A0.5,0.5 0 0,0 3,10.5A0.5,0.5 0 0,0 3.5,10A0.5,0.5 0 0,0 3,9.5M6,9A1,1 0 0,0 5,10A1,1 0 0,0 6,11A1,1 0 0,0 7,10A1,1 0 0,0 6,9M6,17A1,1 0 0,0 5,18A1,1 0 0,0 6,19A1,1 0 0,0 7,18A1,1 0 0,0 6,17M6,13A1,1 0 0,0 5,14A1,1 0 0,0 6,15A1,1 0 0,0 7,14A1,1 0 0,0 6,13Z" />
        </svg>
    })
  },

  async selectMode (mode) {
    this.mode = mode
    this.stashedMode = mode

    if (mode === 3) {
      this.bgPixels = await new Promise(resolve => {
        const im = new Image()
        im.src = '/plugins/nisdos/background/bg-01.jpg'
        im.onload = () => {
          this.ctx.drawImage(im, 0, 0, X_SIZE, X_SIZE * this.aspectRatio)
          resolve(this.ctx.getImageData(0, 0, X_SIZE, X_SIZE * this.aspectRatio)?.data)
        }
        im.onerror = () => resolve(null)
      })
    }

    if (mode > 0) {
      if (this.outputStream) {
        this.api('setLocalVideo', {track: this.outputStream.getVideoTracks()[0]})
        this.perform()
      }
    } else {
      this.api('setLocalVideo', {reset: true})
    }
  },

  async prepare () {
    this.paused = true

    const tracks = this.videoStream.getVideoTracks()

    if (!tracks.length) {
      return
    }

    const settings = tracks[0].getSettings()

    if (settings && settings.width) {
      this.aspectRatio = settings.height / settings.width
    } else {
      this.mbox({text: 'This browser does not support fully support rescaling. Video may be squeezed.'})
    }

    // https://github.com/tensorflow/tfjs-models/tree/master/body-pix
    const options = {
      multiplier: 0.75,
      stride: 32,
      quantBytes: 4,
    }

    try {
      const
        video = document.createElement('video'),
        canvas = document.createElement('canvas')

      video.width = X_SIZE
      video.height = X_SIZE * this.aspectRatio
      video.autoplay = true
      video.srcObject = this.videoStream
      canvas.width = X_SIZE
      canvas.height = X_SIZE * this.aspectRatio

      this.ctx = canvas.getContext('2d')
      this.ctx.imageSmoothingEnabled = false

      this.outputStream = canvas.captureStream(25)
      this.videoElem = video
      this.canvasElem = canvas

      // canvas.style.position = 'absolute'
      // document.getElementById('root').appendChild(canvas)

      this.net = await bodyPix.load(options)
      this.paused = false
    } catch (e) {
      console.log('AI init error', e)
    }
  },

  async perform () {
    if (!this.paused) {
      const
        edgeBlurAmount = 5,
        backgroundBlurAmount = 6,
        segmentation = await this.net.segmentPerson(this.videoElem)

      switch (this.mode) {
        case 1:
          bodyPix.drawBokehEffect(this.canvasElem, this.videoElem, segmentation, backgroundBlurAmount, edgeBlurAmount)
          break

        case 2:
          this.ctx.drawImage(this.videoElem, 0, 0, X_SIZE, X_SIZE * this.aspectRatio)
          const imageData2 = this.ctx.getImageData(0, 0, X_SIZE, X_SIZE * this.aspectRatio)
          const pixel2 = imageData2.data
          for (let p = 0; p < pixel2.length; p += 4) {
            if (segmentation.data[p / 4] === 0) {
              const gray = ((0.3 * pixel2[p]) + (0.59 * pixel2[p + 1]) + (0.11 * pixel2[p + 2]))
              pixel2[p] = gray
              pixel2[p + 1] = gray
              pixel2[p + 2] = gray
            }
          }
          this.ctx.putImageData(imageData2, 0, 0)
          break

        case 3:
          this.ctx.drawImage(this.videoElem, 0, 0, X_SIZE, X_SIZE * this.aspectRatio)
          const imageData = this.ctx.getImageData(0, 0, X_SIZE, X_SIZE * this.aspectRatio)
          const pixel = imageData.data
          for (let p = 0; p < pixel.length; p += 4) {
            if (segmentation.data[p / 4] === 0) {
              if (this.bgPixels) {
                pixel[p] = this.bgPixels[p]
                pixel[p + 1] = this.bgPixels[p + 1]
                pixel[p + 2] = this.bgPixels[p + 2]
              }
            }
          }
          this.ctx.putImageData(imageData, 0, 0)
          break
      }
    }

    window.requestAnimationFrame(() => {
      if (this.mode > 0) {
        this.t0 = Date.now()
        this.perform()
      }
    })
  }
})
