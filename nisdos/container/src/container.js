import * as React from 'preact'
import placeholderHtml from'./iframePlaceholder'

function smartUrl (url) {
  // 1. YouTube helper

  const ytPrefix = 'https://www.youtube.com/watch?v='

  if (url.startsWith(ytPrefix)) {
    const ytId = url.split(ytPrefix)[1].split('&')[0]

    return `https://www.youtube.com/embed/${ytId}`
  }

  return url
}

export default class extends React.Component {
  constructor (props) {
    super(props)

    this.setState({
      url: props.url ?? '',
      urlInput: props.url ?? '',
    })

    this.urlChange = this.urlChange.bind(this)
    this.onKeyUp = this.onKeyUp.bind(this)
    this.onKeyDown = this.onKeyDown.bind(this)
    this.onSync = this.onSync.bind(this)
    this.frameRef = null
  }

  urlChange (ev) {
    let urlInput = ev.target.value.trim()

    if (!urlInput.startsWith('https://') && !urlInput.startsWith('http://')) {
      urlInput = 'https://' + urlInput
    }

    this.setState({urlInput})
  }

  onKeyDown (ev) {
    ev.stopPropagation()
  }

  onKeyUp (ev) {
    ev.stopPropagation()

    if (ev.code === 'Enter') {
      this.setState({url: smartUrl(this.state.urlInput)})
    }
  }

  onSync () {
    const { url } = this.state
    const { id, internalSync } = this.props

    internalSync({id, url})
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.url) {
      this.setState({
        url: nextProps.url,
        urlInput: nextProps.url,
      })
    }
  }

  componentDidMount () {
    if (this.frameRef && !this.state.url) {
      const doc = this.frameRef.contentWindow.document

      doc.open()
      doc.write(placeholderHtml)
      doc.close()
    }
  }

  render () {
    const { width } = this.props
    const { url, urlInput } = this.state

    return (
      <div style={{...styles.container, width}}>
        <div style={styles.topBar}>
          <div style={styles.address}>
            <input
              value={urlInput}
              type="url"
              placeholder="https://"
              style={styles.urlInput}
              onKeyDown={this.onKeyDown}
              onKeyUp={this.onKeyUp}
              onChange={this.urlChange}
            />
          </div>
          <button
            style={styles.button}
            onClick={() => this.setState({url: smartUrl(urlInput)})}
          >
            go
          </button>
          <button
            style={styles.button}
            onClick={this.onSync}
          >
            sync
          </button>
        </div>
        <iframe
          ref={ref => this.frameRef = ref}
          src={url}
          style={styles.iframe}
        />
      </div>
    )
  }
}

const styles = {
  container: {
    height: '100%',
    background: '#f2f2f2',
    borderRadius: 'var(--box-r)',
    overflow: 'hidden',
  },
  topBar: {
    padding: '8px',
    display: 'flex',
  },
  address: {
    width: '100%',
  },
  urlInput: {
    width: '100%',
    height: '1.5rem',
  },
  button: {
    height: '1.5rem',
    cursor: 'pointer',
  },
  iframe: {
    border: 0,
    width: '100%',
    height: 'calc(100% - 36px)',
  },
}
