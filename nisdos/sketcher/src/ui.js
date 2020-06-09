import React, { Component } from 'react'
import CanvasDraw from './canvasDraw'

class UI extends Component {

  constructor(props) {
    super(props)

    this.state = {
      tool: 0,
      color: 'black',
      isShown: false,
    }

    this.draw = null
    this.toggle = this.toggle.bind(this)
  }

  toggle () {
    const { isShown } = this.state
    this.setState({isShown: !isShown})
  }

  handleErase = async () => {
    const { mbox, i18n } = this.props

    if (await mbox({
      text: i18n.t('confirmErase'),
      buttons: { ok: i18n.t('yes'), cancel: i18n.t('no') },
    })) {
      this.draw.clear()
    }
  }

  render () {
    const { isShown, color, tool } = this.state

    if (!isShown) {
      return null
    }

    const colorStyle = (x, border = '#fff') => {
      return {
        width: '28px',
        height: '28px',
        border: `2px dotted ${border}`,
        borderRadius: '32px',
        backgroundColor: x,
      }
    }

    const colors = ['black', 'blue', 'green', 'red', 'yellow']

    return (
      <div style={styles.ui}>
        <div style={styles.controls}>

          <div onClick={this.handleErase} style={styles.button}>
            <svg style={{width: '32px', height: '32px'}} viewBox="0 0 24 24">
              <path fill="#333" d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" />
            </svg>
          </div>

          <div onClick={() => this.draw.undo()} style={styles.button}>
            <svg style={{width: '32px', height: '32px'}} viewBox="0 0 24 24">
              <path fill="#333" d="M12.5,8C9.85,8 7.45,9 5.6,10.6L2,7V16H11L7.38,12.38C8.77,11.22 10.54,10.5 12.5,10.5C16.04,10.5 19.05,12.81 20.1,16L22.47,15.22C21.08,11.03 17.15,8 12.5,8Z" />
            </svg>
          </div>

          {
            colors.map(x => {
              return <div onClick={() => this.setState({color: x})} style={{...styles.button, ...colorStyle(x, x === color ? '#fff' : 'transparent')}} />
            })
          }

          <div onClick={() => this.setState({tool: 0})} style={styles.button}>
            <svg style={{width: '32px', height: '32px'}} viewBox="0 0 24 24">
              <path fill="333" d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z" />
            </svg>
          </div>

          <div onClick={() => this.setState({tool: 1})} style={styles.button}>
            <svg style={{width: '32px', height: '32px'}} viewBox="0 0 24 24">
              <path fill="#333" d="M19,6H22V8H19V11H17V8H14V6H17V3H19V6M17,17V14H19V19H3V6H11V8H5V17H17Z" />
            </svg>
          </div>

          <div onClick={() => this.setState({tool: 2})} style={styles.button}>
            <svg style={{width: '32px', height: '32px'}} viewBox="0 0 24 24">
              <path fill="#333" d="M9.6,14L12,7.7L14.4,14M11,5L5.5,19H7.7L8.8,16H15L16.1,19H18.3L13,5H11Z" />
            </svg>
          </div>

        </div>
        <div style={styles.canvas}>
          <CanvasDraw
            ref={ref => this.draw = ref}
            canvasWidth="100%"
            canvasHeight="100%"
            brushRadius={1}
            brushColor={color}
            drawingTool={tool}
          />
        </div>
      </div>
    )
  }
}

const styles = {
  ui: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: 'calc(100% - 99px)',
    backgroundColor: '#fff',
  },
  controls: {
    paddingTop: '3px',
    borderBottom: '1px solid #aaa',
    display: 'flex',
  },
  button: {
    cursor: 'pointer',
    margin: '0 2px',
  },
  canvas: {
    width: '100%',
    height: '100%',
    cursor: 'crosshair',
  },
}

if (window.matchMedia('screen and (max-width: 480px)').matches) {
  styles.ui = {
    ...styles.ui,
    height: 'calc(100% - 91px)',
  }
}

export default UI
