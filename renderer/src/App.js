
// eslint-disable-next-line
import React, { Component } from 'react';

import { Tooltip } from 'element-react';

// eslint-disable-next-line
import 'element-theme-default';


import { ipcRenderer } from 'electron';

import './App.css';


import Caret from './components/caret';
import PastItems from './components/pastItems';

const lightGrey = 'rgb(243, 243, 243)';


// const getPercentage = (start, end, base = 28800000) => Math.round(base / (new Date(end) - new Date(start)));


function putOngoing(obj) {
  window.localStorage.setItem('ongoing-item', JSON.stringify(obj));
}
function getOngoing() {
  const ongoing = window.localStorage.getItem('ongoing-item');
  if (ongoing) {
    return JSON.parse(ongoing);
  }
  return null;
}

const hrStyle = {
  display: 'block',
  height: '1px',
  border: 0,
  borderTop: '1px solid rgb(173, 173, 173)',
  margin: '0 0 -1px',
  padding: 0,
};

const slashHints = [{
  hint: '/hi',
  id: 'hi',
  create: name => ({ k: `${Date.now()}hi`, name, created: Date.now(), type: 'hi' }),
}, {
  hint: '/bye',
  id: 'bye',
  create: name => ({ k: `${Date.now()}bye`, name, created: Date.now(), type: 'bye' }),
}, {
  hint: '/break',
  id: 'break',
  create: name => ({ k: `${Date.now()}bye`, name, created: Date.now(), type: 'break' }),
}];

const BottomItem = ({ inputRef }) => <div key="bottom_item" style={{ float: 'left', clear: 'both' }} ref={inputRef} />;

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      timeInput: '',
      pastItems: [],
      hints: [],
      interval: null,
      h: 0,
    };

    this.addTime = this.addTime.bind(this);
    this.onInputChange = this.onInputChange.bind(this);
  }


  componentDidMount() {
    document.addEventListener('keydown', (event) => {
      // ESC
      if (event.keyCode === 27) {
        event.stopPropagation();
        event.preventDefault();
        ipcRenderer.send('hide-app');
      }
    });

    console.log('sending', 'get-entries');

    // load possible latest ongoing
    const ongoing = getOngoing();

    ipcRenderer.on('get-entries-resp', (event, data) => {
      console.log({ data });
      if (ongoing) {
        data.push(ongoing);
      }
      this.setState({
        pastItems: data,
      });
    });
    ipcRenderer.send('get-entries');

    // TODO: setState should not be used in componentDidMount
    // eslint-disable-next-line
    this.setState(prevState => ({
      interval: setInterval(() => this.setState({ h: prevState.h + 1 }), 1000),
    }));
  }

  componentWillUnmount() {
    this.setState(prevState => ({
      interval: clearInterval(prevState.interval),
    }));
  }

  onInputChange(event) {
    const { value } = event.target;

    this.setState(prevState => ({
      ...prevState,
      hints: value ? slashHints.filter(hint => hint.hint.startsWith(value)) : [],
      timeInput: value,
    }));
    // setTimeout(() => this.messagesEnd.scrollIntoView({behavior: 'smooth' }), 1000)
  }

  addTime(event) {
    event.preventDefault();
    event.stopPropagation();

    const text = this.state.timeInput;

    if (!text) {
      return;
    }

    this.setState((prevState) => {
      const now = new Date().toISOString();
      // ongoing item
      const last = prevState.pastItems.pop();

      if (last) {
        // finish it
        last.finished = now;
        ipcRenderer.send('new-entry', last);
      }

      // thats the new ongoing item
      let newItem = {};

      // check for special commands
      if (slashHints.some(hint => text.startsWith(hint.hint))) {
        newItem = slashHints.find(hint => text.startsWith(hint.hint)).create(text);
      } else {
        newItem = {
          // TODO: ID creation, rename variable
          k: prevState.pastItems.length + 2 + Date.now(),
          name: text,
          created: now,
        };
      }
      // add new ongoing
      putOngoing(newItem);

      setTimeout(() => this.messagesEnd.scrollIntoView({ behavior: 'smooth' }), 0);

      return {
        ...prevState,
        // put back the now completed ongoing and the new ongoing 
        pastItems: [...prevState.pastItems, last, newItem],
        // reset hint list
        hints: [],
        // reset text input
        timeInput: '',
      };
    });
  }


  render() {
    return (
      <div
        className="App"
        style={{ background: 'transparent', height: '100vh', margin: '0 5px', position: 'relative' }}
      >
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Caret />

        </div>
        <span style={{
          color: '#717171',
          background: lightGrey,
          fontWeight: 'bold',
          fontSize: '11px',
          padding: '10px 0',
          margin: '-1px 0 0',
          width: '100%',
          textAlign: 'center',
          float: 'left',
          borderBottom: '1px solid rgb(173, 173, 173)',
          borderTopLeftRadius: '5px',
          borderTopRightRadius: '5px',
          boxShadow: '0px 1px 3px 0 rgba(0,0,0,.2)',
        }}
        >TIJD</span>

        <PastItems
          bottomitem={<BottomItem inputRef={(input) => { this.messagesEnd = input; }} />}
          items={this.state.pastItems}
        />

        <form onSubmit={this.addTime} style={{ position: 'absolute', left: 0, bottom: 0, width: '100%' }}>
          <hr style={hrStyle} />
          <Tooltip
            placement="top"
            effect="dark"
            width="400"
            visible={!!this.state.hints.length}
            content={<div>{this.state.hints.map(hint => <p key={hint.id}>{hint.hint}</p>)}</div>}
          />

          <input
            type="text"
            placeholder="Type what you are doing..."
            value={this.state.timeInput}
            onChange={this.onInputChange}
            className="main-input"
          />
        </form>
      </div>
    );
  }
}

export default App;
