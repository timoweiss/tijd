
// eslint-disable-next-line
import React, { Component } from 'react';

import Autosuggest from 'react-autosuggest';

// eslint-disable-next-line
import 'element-theme-default';


import { ipcRenderer } from 'electron';

import './App.css';

import { BottomItem } from './components/helper';
import Caret from './components/caret';
import PastItems from './components/pastItems';

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

function renderSuggestion(suggestion) {
  return (
    <div style={{ cursor: 'pointer' }}>
      <span style={{
        fontSize: '13px',
        width: '100%',
        float: 'left',
        clear: 'both',
      }}
      >{suggestion.hint}</span>
      <span style={{
        fontSize: '11px',
        color: '#717171',
      }}
      >{suggestion.description}</span>
    </div>
  );
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
  description: 'start working',
  id: 'hi',
  create: name => ({ k: `${Date.now()}hi`, name, created: new Date().toISOString(), type: 'hi' }),
}, {
  hint: '/bye',
  description: 'end working',
  id: 'bye',
  create: name => ({ k: `${Date.now()}bye`, name, created: new Date().toISOString(), type: 'bye' }),
}, {
  hint: '/break',
  description: 'take a break from working',
  id: 'break',
  create: name => ({ k: `${Date.now()}bye`, name, created: new Date().toISOString(), type: 'break' }),
}];


class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      timeInput: '',
      pastItems: [],
      hints: slashHints,
      interval: null,
      h: 0,
    };

    this.addTime = this.addTime.bind(this);
    this.onInputChange = this.onInputChange.bind(this);
    this.onSuggestionsClearRequested = this.onSuggestionsClearRequested.bind(this);
    this.stopIntervalUpdate = this.stopIntervalUpdate.bind(this);
    this.startIntervalUpdate = this.startIntervalUpdate.bind(this);
  }

  componentWillMount() {
    this.startIntervalUpdate();
  }

  componentDidMount() {
    if (this.inputField) {
      this.inputField.focus();
    }
    window.addEventListener('focus', () => this.inputField && this.inputField.focus());
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
  }

  componentWillUnmount() {
    this.stopIntervalUpdate();
  }

  onInputChange(event, { newValue, method }) {
    console.log({ newValue, method });
    const changeHintList = method !== 'down' && method !== 'up';
    this.setState(prevState => ({
      ...prevState,
      hints: newValue && changeHintList ? slashHints.filter(hint => hint.hint.startsWith(newValue)) : prevState.hints,
      timeInput: newValue,
    }));
    // setTimeout(() => this.messagesEnd.scrollIntoView({behavior: 'smooth' }), 1000)
  }

  onSuggestionsClearRequested() {
    this.setState({
      hints: [],
    });
  }

  stopIntervalUpdate() {
    this.setState(prevState => ({
      interval: clearInterval(prevState.interval),
    }));
  }

  startIntervalUpdate() {
    this.setState(prevState => ({
      interval: setInterval(() => this.setState({ h: prevState.h + 1 }), 1000),
    }));
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
        // hints: [],
        // reset text input
        timeInput: '',
      };
    });
  }


  render() {
    // Autosuggest will pass through all these props to the input.
    const inputProps = {
      placeholder: 'Type what you are doing...',
      value: this.state.timeInput,
      onChange: this.onInputChange,
    };
    return (
      <div
        className="App"
        style={{ background: 'transparent', height: '100vh', margin: '0 5px', position: 'relative' }}
      >
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Caret />

        </div>
        <span className="header">TIJD</span>

        <PastItems
          bottomitem={<BottomItem inputRef={(input) => { this.messagesEnd = input; }} />}
          items={this.state.pastItems}
        />

        <form onSubmit={this.addTime} style={{ position: 'absolute', left: 0, bottom: 0, width: '100%' }}>
          <hr style={hrStyle} />

          <Autosuggest
            suggestions={this.state.hints}
            onSuggestionsFetchRequested={() => { }}
            onSuggestionsClearRequested={this.onSuggestionsClearRequested}
            getSuggestionValue={val => val.hint}
            renderSuggestion={renderSuggestion}
            ref={(value) => { this.inputField = value && value.input ? value.input : null; }}
            inputProps={inputProps}
            className="main-input"
          />
        </form>
      </div>
    );
  }
}

export default App;
