import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolViewProps, SymbolWeight } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type MaterialIconName = ComponentProps<typeof MaterialIcons>['name'];

// Mapping ist absichtlich "partial": nicht jedes SF Symbol muss gemappt sein
const MAPPING: Partial<Record<SymbolViewProps['name'], MaterialIconName>> = {
    'house.fill': 'home',
    'paperplane.fill': 'send',
    'chevron.left.forwardslash.chevron.right': 'code',
    'chevron.right': 'chevron-right',

    // Ergänzungen für eure Tabs / UI:
    'fork.knife': 'restaurant',
    'clock.fill': 'schedule',
    'sparkles': 'auto-awesome',
    'heart.fill': 'favorite',
    'heart': 'favorite-border',
    'gearshape.fill': 'settings',
};

export function IconSymbol({
                               name,
                               size = 24,
                               color,
                               style,
                           }: {
    name: SymbolViewProps['name'];
    size?: number;
    color: string | OpaqueColorValue;
    style?: StyleProp<TextStyle>;
    weight?: SymbolWeight;
}) {
    const mapped = MAPPING[name] ?? 'help-outline';
    return <MaterialIcons color={color} size={size} name={mapped} style={style} />;
}
