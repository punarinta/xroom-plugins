import 'regenerator-runtime/runtime'
import * as React from 'preact'
import UI from './ui'

const X_SIZE = 480

function onStreamChanged () {
  const { camOn } = xroom.api('getFlags')

  if (this.paused && camOn && this.tfLoaded) {
    const systemVT = xroom.api('getStreams').local.getVideoTracks()[0]

    if (this.outputStream && this.outputStream.getVideoTracks()[0].id === systemVT.id) {
      return
    }

    this.videoStream = new MediaStream([systemVT])
    this.camLoaded = true
    this.prepare()

    if (this.stashedMode) {
      this.selectMode(this.stashedMode)
    }
  } else if (!camOn && !this.paused) {
    this.paused = true
    this.stashedMode = this.mode
  }
}

async function onFlagsChange ({ peerId, mf }) {
  if (peerId === 'self') {
    if (!mf[1] && !this.paused) {
      this.paused = true
      this.stashedMode = this.mode
    } else if (this.paused) {
      const systemVT = xroom.api('getStreams').local.getVideoTracks()[0]

      this.videoStream = new MediaStream([systemVT])
      this.camLoaded = true
      this.prepare()

      if (this.stashedMode) {
        this.selectMode(this.stashedMode)
      }
    }
  }
}

xroom.plugin = {
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
    'peer/flags': onFlagsChange,
  },

  async register () {
    xroom.api('addUI', {
      component: <UI
        ui={xroom.ui}
        api={xroom.api}
        mbox={xroom.mbox}
        i18n={xroom.i18n}
        ref={(ref) => { this.uiRef = ref} }
        onModeSelect={mode => this.selectMode(mode)}
      />
    })

    await xroom.api('appendScript', { src: 'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@1.2' })
    await xroom.api('appendScript', { src: 'https://cdn.jsdelivr.net/npm/@tensorflow-models/body-pix@2.0' })

    tf.enableProdMode()
    await tf.ready()

    this.tfLoaded = true

    const sysStream = xroom.api('getStreams').local

    if (!this.videoStream && sysStream) {
      this.videoStream = new MediaStream(sysStream.getVideoTracks())
      this.camLoaded = true
      this.prepare()
    }

    this.addIcon()
  },

  unregister () {
    xroom.api('removeIcon')

    if (this.mode) {
      xroom.api('setLocalVideo', {reset: true})
    }
  },

  isSupported () {
    return (
      window.navigator.mediaDevices &&
      window.navigator.mediaDevices.getUserMedia &&
      window.WebAssembly &&
      !window.matchMedia('(max-width: 480px)').matches && // to disable phones
      !!window.MediaRecorder && window.MediaRecorder.isTypeSupported('video/webm') // disable safari
    )
  },

  addIcon () {
    xroom.api('addIcon', {
      title: () => xroom.i18n.t('iconCaption'),
      onClick: () => this.uiRef.toggleShow(),
      svg: props =>
        <svg width={props.size || 25} height={props.size || 25} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path stroke={props.color} d="M26 5H6a1 1 0 00-1 1v20c0 .6.4 1 1 1h20c.6 0 1-.4 1-1V6c0-.6-.4-1-1-1z" stroke-width={1.5 * 32/25} stroke-linecap="round" stroke-linejoin="round" />
          <path stroke={props.color} d="M27 20l-5.3-5.3a1 1 0 00-1.4 0l-5.6 5.6a1 1 0 01-1.4 0l-2.6-2.6a1 1 0 00-1.4 0L5 22" stroke-width={1.5 * 32/25} stroke-linecap="round" stroke-linejoin="round" />
          <path stroke={props.color} d="M12.5 13a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" stroke-width={1.5 * 32/25} stroke-linecap="round" stroke-linejoin="round" />
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
        xroom.api('setLocalVideo', {track: this.outputStream.getVideoTracks()[0]})
        this.perform()
      }
    } else {
      xroom.api('setLocalVideo', {reset: true})
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
      xroom.mbox({text: 'This browser does not support fully support rescaling. Video may be squeezed.'})
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
    try {

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

    } catch (e) {
      this.paused = true
      this.stashedMode = this.mode
    }

    window.requestAnimationFrame(() => {
      if (this.mode > 0) {
        this.t0 = Date.now()
        this.perform()
      }
    })
  }
}
