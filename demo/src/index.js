import React, {Component} from 'react';
import {render} from 'react-dom';

import MeetupPlugin from '../../src';

const APP_ID = '91503904-4c8a-4c2c-94d8-1cc87cb65e35';

const QUERY_ID = '889da917-4b61-4042-8788-302930e52c01';

function isReasonMLEvent({name, description, group}) {
  return [name, description, group.name]
    .join(' ')
    .toLowerCase()
    .includes('reasonml');
}

class Demo extends Component {
  render() {
    return (
      <MeetupPlugin
        appId={APP_ID}
        queryId={QUERY_ID}
        filter={isReasonMLEvent}
      />
    );
  }
}

render(<Demo />, document.querySelector('#demo'));
