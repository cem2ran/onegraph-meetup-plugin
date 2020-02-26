import React from 'react';
import formatDate from 'date-fns/format';

// Query:
// query MeetupEvents {
//   meetup {
//     makeRestCall {
//       get(
//         path: "/find/upcoming_events"
//         query: [
//           ["radius", "global"],
//           ["text", "reasonml"],
//           ["order", "time"]
//         ]
//       ) {
//         jsonBody
//       }
//     }
//   }
// }

async function fetchQuery(docId, appId) {
  const resp = await fetch(
    'https://serve.onegraph.com/graphql?app_id=' + appId,
    {
      method: 'POST',
      headers: {'Content-Type': 'application/json', Accept: 'application/json'},
      body: JSON.stringify({doc_id: docId}),
    },
  );
  const json = await resp.json();
  return json.data;
}

function formatTime(localTime) {
  const [hour, min] = localTime.split(':');
  const hourNum = parseInt(hour, 10);
  const am_pm = hourNum > 11 ? 'PM' : 'AM';
  return `${hourNum % 12 || '12'}:${min} ${am_pm}`;
}

function Link({link, children}) {
  return (
    <a
      style={styles.link}
      href={link}
      target="_blank"
      rel="noopener noreferrer">
      {children}
    </a>
  );
}

export default function MeetupEvents({queryId, appId, filter}) {
  const [data, setData] = React.useState(null);
  React.useEffect(() => {
    if (!data) {
      fetchQuery(queryId, appId).then(res => setData(res));
    }
  }, [data, setData]);
  if (!data) {
    return null;
  }

  const events = data.meetup.makeRestCall.get.jsonBody.events.filter(
    filter || (_ => true),
  );
  const byDay = events.reduce((acc, event) => {
    const dayEvents = acc[event.local_date] || [];
    dayEvents.push(event);
    acc[event.local_date] = dayEvents;
    return acc;
  }, {});
  return (
    <div style={styles.container}>
      {Object.keys(byDay).map(localDate => {
        const events = byDay[localDate];
        return (
          <div key={localDate}>
            <div style={styles.timeHeading}>
              {formatDate(new Date(localDate), 'EEEE, MMMM d')}
            </div>
            <div style={styles.eventsListing}>
              {events.map((event, i) => (
                <div
                  style={{
                    ...styles.event,
                    ...(i === 0 ? styles.firstEvent : {}),
                  }}
                  key={event.id}>
                  <div style={styles.eventTime}>
                    <Link link={event.link}>
                      {formatTime(event.local_time)}
                    </Link>
                  </div>
                  <div style={styles.eventDetails}>
                    <div style={styles.eventGroup}>
                      <Link
                        link={`https://www.meetup.com/${event.group.urlname}`}>
                        {event.group.name}
                      </Link>
                    </div>
                    <div style={styles.eventName}>
                      <Link link={event.link}>{event.name}</Link>
                    </div>
                    <div style={styles.eventRsvp}>
                      {event.yes_rsvp_count} {event.group.who} going
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

const styles = {
  container: {fontFamily: 'helvetica,arial,sans-serif', maxWidth: 600},
  timeHeading: {
    textTransform: 'uppercase',
    fontWeight: 600,
    fontSize: 13,
    lineHeight: 1.6,
    letterSpacing: '-.02em',
    wordSpacing: '.1em',
    color: 'rgba(0,0,0,.87)',
    paddingLeft: 12,
    paddingBottom: 12,
  },
  eventsListing: {
    border: '1px solid rgba(0,0,0,.12)',
    borderRadius: '3px',
    margin: '0 0 16px',
    padding: 0,
  },
  event: {
    padding: '16px 16px 0',
    borderTop: '1px solid rgba(0,0,0,.12)',
    fontSize: 16,
    display: 'flex',
  },
  firstEvent: {borderWidth: 0},
  eventTime: {color: 'rgba(0,0,0,.54)', flexShrink: 0, lineHeight: 1.45},
  eventDetails: {paddingLeft: 16, marginBottom: 16},
  eventGroup: {
    textTransform: 'uppercase',
    color: 'rgba(0,0,0,.54)',
    fontSize: 13,
    fontWeight: 600,
    lineHeight: 1.6,
    letterSpacing: '-.02em',
    wordSpacing: '.1em',
  },
  eventName: {
    fontSize: 20,
    lineHeight: 1.25,
    fontWeight: 500,
    letterSpacing: '-.02em',
    wordWrap: 'break-word',
  },
  eventRsvp: {color: 'rgba(0,0,0,.54)', fontSize: 16},
  link: {color: 'inherit', textDecoration: 'none'},
};
