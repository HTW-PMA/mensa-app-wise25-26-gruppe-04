import { View, StyleSheet, Image } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Picker } from '@react-native-picker/picker';
import { useState } from 'react';
import { useThemeColor } from '@/hooks/use-theme-color';

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
    const surfaceColor = useThemeColor({}, 'surface');
    const borderColor = useThemeColor({}, 'border');
    const rowColor = useThemeColor({ light: '#F2F3F5', dark: '#2C2C2E' }, 'background');
    const textColor = useThemeColor({}, 'text');

    return (
        <View style={[styles.wrapper, { backgroundColor: surfaceColor, borderBottomColor: borderColor }]}>
            <View style={styles.left}>
                <Image
                    source={require('@/assets/images/home-icon.png')}
                    style={styles.logo}
                />
                <ThemedText type="subtitle" style={styles.brand}>
                    UniMensa Berlin
                </ThemedText>
            </View>

            <View style={[styles.right, { backgroundColor: rowColor }]}>
                <Picker
                    selectedValue={selected}
                    onValueChange={setSelected}
                    style={[styles.picker, { color: textColor }]}
                    dropdownIconColor={textColor}
                >
                    {UNIVERSITIES.map(u => (
                        <Picker.Item key={u} label={u} value={u} color={textColor} />
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
        borderBottomWidth: 1,
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
        borderRadius: 12,
        overflow: 'hidden',
    },
    picker: {
        height: 36,
        width: 260,
    },
});
