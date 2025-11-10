import React, { useState, useEffect } from 'react';
import { Text, View } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import pb from '../services/pocketbase';

export default function EventsMapScreen({ navigation }) {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    pb.collection('events').getFullList().then(setEvents).catch(console.log);
  }, []);

  return (
    <MapView
      style={{ flex: 1 }}
      initialRegion={{ latitude: -8.760, longitude: -63.899, latitudeDelta: 0.05, longitudeDelta: 0.05 }}
    >
      {events.map(event =>
        event.location && (
          <Marker key={event.id} coordinate={{ latitude: event.location.latitude, longitude: event.location.longitude }}>
            <Callout onPress={() => navigation.navigate('EventDetail', { event })}>
              <View style={{ width: 150 }}>
                <Text style={{ fontWeight: 'bold' }}>{event.name}</Text>
                <Text>{event.date}</Text>
                <Text>{event.address}</Text>
              </View>
            </Callout>
          </Marker>
        )
      )}
    </MapView>
  );
}
