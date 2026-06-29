import React from 'react';
import { View } from 'react-native';
import { buildTransitMapHtml } from './transitMapHtml';

// Web network map — Leaflet inside an iframe (react-native-webview isn't reliable on web).
export default function TransitMap({ height = 300 }: { height?: number }) {
  return (
    <View style={{ height, borderRadius: 16, overflow: 'hidden', borderWidth: 0.5, borderColor: 'rgba(107,91,78,0.18)' }}>
      {React.createElement('iframe', {
        srcDoc: buildTransitMapHtml(),
        title: 'Naples transit map',
        allow: 'geolocation',
        style: { border: 'none', width: '100%', height: '100%' },
      })}
    </View>
  );
}
