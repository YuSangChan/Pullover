import React from 'react'
import { Col, Input, Row } from 'react-bootstrap'

import Window, { showItemInFolder } from '../nw/Window'
import Settings from '../services/Settings'
import SoundCache from '../services/SoundCache'
import InfoBox from './InfoBox'

import Debug from '../lib/debug'
import './Settings.scss'

var debug = Debug('SettingsComponent')

const SettingsComponent = React.createClass({
  displayName: 'Settings',

  getInitialState() {
    let state = Settings.getAll()
    state.infoMaxNotificationQueue = false
    return state
  },

  // Subscribe to Settings changes
  componentDidMount() {
    Settings.on('change', this.updateState)
  },
  // Resize window
  componentWillMount() {
    Window.resizeTo(Settings.get('windowWidth'), 400)
  },
  // Unsubscribe before unmounting component
  componentWillUnmount() {
    Settings.removeListener('change', this.updateState)
    // Revert to old size
    Window.resizeTo(Settings.get('windowWidth'), Settings.get('windowHeight'))
  },
  // Update state
  updateState(event) {
    const partialUpdate = {}
    partialUpdate[event.key] = event.value
    this.setState(partialUpdate)
  },

  render() {
    let runOnStartup = ''
    if (Settings.runOnStartupSupported()) {
      runOnStartup = (
        <div>
          <Row>
            <Col xs={8}>
              <b className="link" onClick={this.toggleRunOnStartup}>Run on startup</b>
            </Col>
            <Col xs={4}>
              <input type="checkbox" readOnly checked={this.state.runOnStartup} onClick={this.toggleRunOnStartup}/>
            </Col>
          </Row>
          <hr />
        </div>
      )
    }

    // Max notification queue
    const formMaxNotificationClasses = (this.state.maxNotificationAmount === '')
      ? 'form-group has-feedback has-error' : 'form-group'

    // Default sound
    const defaultSoundOptions = SoundCache.getSoundList().map((element, index) => {
      return (
        <option value={element[0]} key={index}>{element[1]}</option>
      )
    })

    return (
      <div>
        <Row>
          <Col md={8} mdOffset={2}>
            <h1 className="center-block">Settings</h1>
            <Row>
              <Col xs={10} xsOffset={1}>
                <hr />
                {runOnStartup}
                <Row>
                  <Col xs={9}>
                    <b>Max. notifications queue</b> <span onClick={this.showInfoMaxNotificationQueue}
                                                          className="infoboxIcon glyphicon glyphicon-question-sign" />
                  </Col>
                  <Col xs={2}>
                    <div className={formMaxNotificationClasses}>
                      <input type="input" maxLength="2" className="form-control smallInput"
                             ref="maxNotificationAmount" value={this.state.maxNotificationAmount}
                             onChange={this.updateMaxNotificationQueue}/>
                      <span className="glyphicon glyphicon-remove form-control-feedback" />
                    </div>
                  </Col>
                </Row>
                <hr />
                <Row>
                  <Col xs={7}><b>Default sound</b></Col>
                  <Col xs={5}>
                    <div className="default-class">
                      <select ref="defaultSound" className="form-control" value={this.state.defaultSound}
                              onChange={this.updateDefaultSound}>
                        {defaultSoundOptions}
                      </select>
                    </div>
                  </Col>
                </Row>
                <hr />
                <span className="text-primary">
                  <a className="link" onClick={this.showDevTools}>Show dev tools</a>
                </span> | <span className="text-primary">
                  <a className="link" onClick={this.showLogsFolder}>Open log file folder</a>
                </span>
              </Col>
            </Row>
          </Col>
        </Row>
        <InfoBox active={this.state.infoMaxNotificationQueue} close={this.hideInfoMaxNotificationQueue}
                 title="Max. notifications queue">
          If you don't use this computer very often, there is a chance that a lot of notifications queue up.
          With this setting you can limit the number of notifications shown. <br/>
          If you set a value of <code>10</code> and <code>50</code> notifications are due to be shown on this device,
          Pullover will only show the <b><code>10</code> most recent</b> notifications.<br/>
          <b>Default: </b><code>20</code>
        </InfoBox>
      </div>
    )
  },

  hideInfoMaxNotificationQueue() {
    this.setState({infoMaxNotificationQueue: false})
  },

  showInfoMaxNotificationQueue() {
    this.setState({infoMaxNotificationQueue: true})
  },

  toggleRunOnStartup() {
    Settings.set('runOnStartup', !this.state.runOnStartup)
  },

  updateDisplayTime() {
    // Only update if a number, greater zero and different
    // from the current state
    const newDisplayTime = parseInt(this.refs.displayTime.value)
    if (!isNaN(newDisplayTime)
      && newDisplayTime > 0
      && newDisplayTime !== this.state.displayTime) {
      Settings.set('displayTime', newDisplayTime)
    }
    // Allow an empty field for usability
    else if (this.refs.displayTime.value === '') {
      this.setState({displayTime: ''})
    }
  },

  updateMaxNotificationQueue() {
    // Only update if a number, greater zero and different
    // from the current state
    const newMaxNotificationAmount = parseInt(this.refs.maxNotificationAmount.value)
    if (!isNaN(newMaxNotificationAmount)
      && newMaxNotificationAmount > 0
      && newMaxNotificationAmount !== this.state.maxNotificationAmount) {
      Settings.set('maxNotificationAmount', newMaxNotificationAmount)
    }
    // Allow an empty field for usability
    else if (this.refs.maxNotificationAmount.value === '') {
      this.setState({maxNotificationAmount: ''})
    }
  },

  updateDefaultSound() {
    const defaultSound = this.refs.defaultSound.value
    Settings.set('defaultSound', defaultSound)
  },

  showLogsFolder() {
    showItemInFolder(debug.getLogFilePath())
  },

  showDevTools() {
    Window.showDevTools()
  }

})

export default SettingsComponent
