import { useState } from 'react';
import type { Conversation } from './types';
import Home from './screens/Home';
import Chat from './screens/Chat';
import English from './screens/English';
import Practice from './screens/Practice';
import { stopSpeaking } from './speech';

type Route =
  | { name: 'home' }
  | { name: 'chat' }
  | { name: 'english'; conv: Conversation }
  | { name: 'practice'; conv: Conversation; index: number };

export default function App() {
  const [route, setRoute] = useState<Route>({ name: 'home' });
  const go = (r: Route) => {
    stopSpeaking();
    setRoute(r);
    window.scrollTo(0, 0);
  };

  switch (route.name) {
    case 'home':
      return <Home onStart={() => go({ name: 'chat' })} onOpen={(conv) => go({ name: 'english', conv })} />;
    case 'chat':
      return (
        <Chat
          onCancel={() => go({ name: 'home' })}
          onFinished={(conv) => go({ name: 'english', conv })}
        />
      );
    case 'english':
      return (
        <English
          conv={route.conv}
          onBack={() => go({ name: 'home' })}
          onPick={(index) => go({ name: 'practice', conv: route.conv, index })}
        />
      );
    case 'practice':
      return (
        <Practice
          key={route.index}
          conv={route.conv}
          index={route.index}
          onNext={() => go({ ...route, index: route.index + 1 })}
          onExit={() => go({ name: 'english', conv: route.conv })}
        />
      );
  }
}
