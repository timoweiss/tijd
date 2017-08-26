import React, { Component } from 'react';

import './App.css';
import { Tooltip } from 'element-react';
import ReactTooltip from 'react-tooltip'
// import TA from 'time-ago'; 
import 'element-theme-default';
import moment from 'moment';
import TimeAgo from 'time-ago';


import { ipcRenderer } from 'electron';

import { getDetailedTimeFromTo, getDetailedTimeToNow } from './helper/zeit';
import Caret from './components/caret';

const lightGrey = 'rgb(243, 243, 243)';


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
const PluralSingular = ({ num, singular }) => num ? <span>{num} {num > 1 ? singular + 's' : singular} </span> : null;
const DetailedTime = ({ from, to }) => {
  const dt = to ? getDetailedTimeFromTo(from, to) : getDetailedTimeToNow(from);
  return (
    <div>
      <PluralSingular num={dt.days} singular="day" />
      <PluralSingular num={dt.hours} singular="hour" />
      <PluralSingular num={dt.days} singular="day" />
      <PluralSingular num={dt.minutes} singular="minute" />
      <PluralSingular num={dt.seconds} singular="second" />
    </div>
  )
};

const TimeContent = ({ item }) => <div data-tip data-for={item.k + 'tt'}><span>{item.finished ? ta.duration(item.created, item.finished) : 'started ' + ta.ago(item.created)}</span></div>;

const Time = ({ item }) => {
  return (
    <div style={{ fontSize: '10px' }}>
      <ReactTooltip place="left" effect="solid" id={item.k + 'tt'}><DetailedTime from={item.created} to={item.finished} /></ReactTooltip>
      <TimeContent item={item} />
    </div>
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
      background: 'white',
      maxHeight: 'calc(100vh - 80px)'
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

const BottomItem = ({ refElem }) => <div key='bottom_item' style={{ float: "left", clear: "both" }} ref={(el) => { refElem = el; }} />

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
      <div className="App" style={{ background: 'transparent', height: '100vh' }}>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Caret />

        </div>
        <span style={{
          color: '#717171',
          background: lightGrey,
          fontWeight: 'bold',
          fontSize: '11px',
          padding: '10px 0',
          width: '100%',
          textAlign: 'center',
          float: 'left',
          borderBottom: '1px solid rgb(173, 173, 173)',
          borderTopLeftRadius: '5px',
          borderTopRightRadius: '5px'

        }}>TIJD</span>

        <PastItems bottomitem={<BottomItem refElem={this.messagesEnd} />} items={this.state.pastItems} />

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

    // load possible latest ongoing
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
    ipcRenderer.send('get-entries');

    this.setState((prevState) => ({
      interval: setInterval(() => this.setState({ h: prevState.h + 1 }), 1000)
    }));
    console.log('comp did mount', { a, b, c })
  }

  componentWillUnmount() {
    this.setState((prevState) => ({
      interval: clearInterval(prevState.interval)
    }));
  }

  addTime = (event) => {
    event.preventDefault();
    event.stopPropagation();

    const text = this.state.timeInput;

    if (!text) {
      return;
    }

    this.setState(prevState => {

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
        }
      }
      // add new ongoing
      putOngoing(newItem);

      return {
        ...prevState,
        // put back the now completed ongoing and the new ongoing 
        pastItems: [...prevState.pastItems, last, newItem],
        // reset hint list
        hints: [],
        // reset text input
        timeInput: ''
      };
    });
  }

  onInputChange = (event) => {
    const { value } = event.target;

    this.setState(prevState => ({
      ...prevState,
      hints: value ? slashHints.filter(hint => hint.hint.startsWith(value)) : [],
      timeInput: value
    }))
    setTimeout(() => this.messagesEnd.scrollIntoView({ behavior: 'smooth' }), 1000)
  }
}

export default App;
