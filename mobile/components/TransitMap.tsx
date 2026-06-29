import { View } from 'react-native';
import { WebView } from 'react-native-webview';
import { buildTransitMapHtml } from './transitMapHtml';

// Native (iOS/Android) network map — Leaflet inside a WebView. Web uses TransitMap.web.tsx.
export default function TransitMap({ height = 300 }: { height?: number }) {
  return (
    <View style={{ height, borderRadius: 16, overflow: 'hidden' }}>
      <WebView
        originWhitelist={['*']}
        source={{ html: buildTransitMapHtml() }}
        style={{ flex: 1, backgroundColor: '#EDE8DE' }}
        geolocationEnabled
      />
    </View>
  );
}
