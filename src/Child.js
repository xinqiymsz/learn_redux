import React from 'react';

import './App.css';



class Child extends React.Component {

  render () {
    return (
    <div>
      {this.context.title}
    </div>)
  }
}

export default Child;
