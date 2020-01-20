import React from 'react';
import Parent from './Parent';
import './App.css';



class App extends React.Component {
  state = {
    lala: 111
  }

  static childContextTypes = {
    title: Prototype.string
  }

  getChildContext() {
    return this.state.lala
  }

  render () {
    return (
    <div>{1}
      <Parent />
    </div>)
  }
}

export default App;
