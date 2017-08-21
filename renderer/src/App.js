import React, { Component } from 'react';

import './App.css';
import { Tooltip } from 'element-react';
// import TA from 'time-ago'; 
import 'element-theme-default';
import moment from 'moment';
import TimeAgo from 'time-ago';

import { ipcRenderer } from 'electron';

const { ago, today } = TimeAgo();


function putOngoing(obj) {
  localStorage.setItem('ongoing-item', JSON.stringify(obj));
}
function getOngoing() {
  const ongoing = localStorage.getItem('ongoing-item');
  if (ongoing) {
    return JSON.parse(ongoing);
  }
  return null;
}

const groupBySameday = items => items.reduce(
  (groups, item) => {
    const dayOfYear = moment(item.created).dayOfYear();
    groups[dayOfYear] = groups[dayOfYear] || [];
    groups[dayOfYear].push(item);
    return groups;
  },
  {});

const ta = {
  duration: (date, end) => moment(date).from(end || new Date(), true),
  ago: (date) => moment(date).fromNow(),
};

const Time = ({ item }) => {

  const a = (b, c, d) => console.log('enter', { b, c, d });
  return (
    <Tooltip style={{ fontSize: '10px' }} placement="top" content={<span>{ago(item.created)}</span>}>
      {item.finished ? ta.duration(item.created, item.finished) : 'started ' + ta.ago(item.created)}
    </Tooltip>
  );
};
const DelimiterItem = ({ dateString }) => <div className="delimiter-item"><span>{dateString}</span></div>;

const PastItem = ({ item }) => <div className="past-item"><span>{item.name}</span><Time item={item} /></div>;

const PastItems = ({ items, bottomitem }) => {
  const itemsGroupedByDay = groupBySameday(items);
  const days = Object.keys(itemsGroupedByDay);
  const elems = [];
  days.forEach(day => {
    const creationDate = moment().dayOfYear(day);
    elems.push(
      <DelimiterItem key={'delimiter_' + day} dateString={creationDate.format('dddd, MMMM Do YYYY')} />,
      ...itemsGroupedByDay[day].map(item => console.log({ item }) || <PastItem key={item.k} item={item} />)
    );
  });

  return (
    <div style={{
      overflow: 'scroll',
      position: 'absolute',
      bottom: '34px',
      width: '100%',
      maxHeight: 'calc(100vh - 34px)'
    }}
    >{elems}
      {bottomitem}
    </div>
  );
};

const hrStyle = {
  display: 'block',
  height: '1px',
  border: 0,
  borderTop: '1px solid rgb(173, 173, 173)',
  margin: '0',
  padding: 0,
}

const slashHints = [{
  hint: '/hi',
  id: 'hi',
  create: name => ({ k: Date.now() + 'hi', name, created: Date.now(), type: 'hi' }),
}, {
  hint: '/bye',
  id: 'bye',
  create: name => ({ k: Date.now() + 'bye', name, created: Date.now(), type: 'bye' }),
}, {
  hint: '/break',
  id: 'break',
  create: name => ({ k: Date.now() + 'bye', name, created: Date.now(), type: 'break' }),
}];

class App extends Component {
  state = {
    timeInput: '',
    pastItems: [],
    hints: [],
    interval: null,
    h: 0,
  }
  render() {

    return (
      <div className="App" style={{ background: 'white', height: '100vh' }}>
        <PastItems bottomitem={<div key='asdöja' style={{ float: "left", clear: "both" }}
          ref={(el) => { this.messagesEnd = el; }} />} items={this.state.pastItems} />

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
            placeholder='Type what you are doing...'
            value={this.state.timeInput}
            onChange={this.onInputChange}
            className="main-input"
          />
        </form>
      </div>
    );
  }

  componentDidMount(a, b, c) {
    console.log('sending', 'get-entries')

    ipcRenderer.send('get-entries');

    // load latest ongoing
    const ongoing = getOngoing();

    ipcRenderer.on('get-entries-resp', (event, data) => {
      console.log({ data })
      if (ongoing) {
        data.push(ongoing);
      }
      this.setState({
        pastItems: data
      })
    })
    this.setState((prevState) => ({
      interval: setInterval(() => this.setState({ h: prevState.h + 1 }), 2000)
    }));
    console.log('comp did mount', { a, b, c })
  }

  componentWillUnmount() {
    this.setState((prevState) => ({
      interval: clearInterval(prevState.interval)
    }));
  }

  componentDidUpdate(a, b, c) {
    console.log('comp did up', { a, b, c })
  }

  addTime = (event) => {
    event.preventDefault();
    event.stopPropagation();


    const text = this.state.timeInput;

    if (!text) {
      return;
    }



    this.setState(prevState => {

      const last = getOngoing();
      const now = new Date().toISOString();
      if (last) {
        last.finished = now;
        ipcRenderer.send('new-entry', last);
      }

      let newItem = {};

      if (slashHints.some(hint => text.startsWith(hint.hint))) {
        newItem = slashHints.find(hint => text.startsWith(hint.hint)).create(text);
      } else {
        newItem = {
          k: prevState.pastItems.length + 2 + Date.now(),
          name: text,
          created: now,
        }
      }
      // add new ongoing
      putOngoing(newItem);

      prevState.pastItems.pop();


      return {
        ...prevState,
        pastItems: [...prevState.pastItems, last, newItem],
        hints: [],
        timeInput: ''
      };
    });
  }

  onInputChange = (event) => {
    const { value } = event.target;

    this.setState(prevState => ({
      ...prevState,
      hints: !value ? [] : slashHints.filter(hint => hint.hint.startsWith(value)),
      timeInput: value
    }))
    setTimeout(() => this.messagesEnd.scrollIntoView({ behavior: 'smooth' }), 1000)
  }
}

export default App;
