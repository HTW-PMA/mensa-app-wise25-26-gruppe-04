import { View, StyleSheet, Image } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Picker } from '@react-native-picker/picker';
import { useState } from 'react';

const UNIVERSITIES = [
    'Freie Universität Berlin (FU)',
    'Humboldt-Universität zu Berlin (HU)',
    'Technische Universität Berlin (TU)',
    'Universität der Künste Berlin (UdK)',
    'Charité – Universitätsmedizin Berlin',
    'Weißensee Kunsthochschule Berlin',
    'Hochschule für Musik Hanns Eisler',
    'Hochschule für Schauspielkunst Ernst Busch',
    'Berliner Hochschule für Technik (BHT)',
    'HTW Berlin',
    'HWR Berlin',
    'Alice Salomon Hochschule',
    'Evangelische Hochschule Berlin',
    'Katholische Hochschule für Sozialwesen Berlin',
    'Hochschule des Bundes',
    'MSB Medical School Berlin',
    'ESCP Business School',
    'ESMT Berlin',
    'IPU Berlin',
    'Hertie School',
    'Psychologische Hochschule Berlin',
    'Bard College Berlin',
];

export function AppHeader() {
    const [selected, setSelected] = useState('HTW Berlin');

    return (
        <View style={styles.wrapper}>
            <View style={styles.left}>
                <Image
                    source={require('@/assets/images/home-icon.png')}
                    style={styles.logo}
                />
                <ThemedText type="subtitle" style={styles.brand}>
                    UniMensa Berlin
                </ThemedText>
            </View>

            <View style={styles.right}>
                <Picker
                    selectedValue={selected}
                    onValueChange={setSelected}
                    style={styles.picker}
                >
                    {UNIVERSITIES.map(u => (
                        <Picker.Item key={u} label={u} value={u} />
                    ))}
                </Picker>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        height: 64,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#FFFFFFEE',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    left: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    logo: {
        width: 26,
        height: 26,
    },
    brand: {
        fontWeight: '600',
        fontSize: 16,
    },
    right: {
        backgroundColor: '#F2F3F5',
        borderRadius: 12,
        overflow: 'hidden',
    },
    picker: {
        height: 36,
        width: 260,
    },
});