import { View } from 'react-native';
import { WebView } from 'react-native-webview';
import { buildMapHtml, type MapPoint } from './mapHtml';

// Native (iOS/Android) map — Leaflet inside a WebView. Web uses Map.web.tsx.
export default function Map({ points, height = 220 }: { points: MapPoint[]; height?: number }) {
  if (!points.length) return null;
  return (
    <View style={{ height, borderRadius: 12, overflow: 'hidden' }}>
      <WebView
        originWhitelist={['*']}
        source={{ html: buildMapHtml(points) }}
        style={{ flex: 1, backgroundColor: '#EDE8DE' }}
        scrollEnabled={false}
      />
    </View>
  );
}
