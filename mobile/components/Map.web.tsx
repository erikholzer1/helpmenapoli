import React from 'react';
import { View } from 'react-native';
import { buildMapHtml, type MapPoint } from './mapHtml';

// Web map — Leaflet inside an iframe (react-native-webview isn't reliable on web).
export default function Map({ points, height = 220 }: { points: MapPoint[]; height?: number }) {
  if (!points.length) return null;
  return (
    <View style={{ height, borderRadius: 12, overflow: 'hidden', borderWidth: 0.5, borderColor: 'rgba(107,91,78,0.18)' }}>
      {React.createElement('iframe', {
        srcDoc: buildMapHtml(points),
        title: 'map',
        style: { border: 'none', width: '100%', height: '100%' },
      })}
    </View>
  );
}
