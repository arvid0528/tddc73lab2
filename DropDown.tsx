import React, { useState } from 'react';
import {
    Pressable,
    StyleProp,
    StyleSheet,
    Text,
    TextStyle,
    View,
    ViewStyle,
} from 'react-native';
import { Menu } from 'react-native-paper';

type DropdownProps = {
    style?: StyleProp<ViewStyle>;
    pickerStyle?: StyleProp<TextStyle>;
};

type NumberDropdownProps = DropdownProps & {
    options: string[];
    initialValue: string;
};

function NumberDropdown({ style, pickerStyle, options, initialValue }: NumberDropdownProps) {
const [value, setValue] = useState(initialValue);
const [isOpen, setIsOpen] = useState(false);

return (
    <View style={styles.container}>
        <Menu
            visible={isOpen}
            onDismiss={() => setIsOpen(false)}
            anchor={
                <Pressable
                    onPress={() => setIsOpen(open => !open)}
                    style={[styles.trigger, style]}
                >
                    <Text style={[styles.triggerText, pickerStyle]}>
                        {value} {isOpen ? '▲' : '▼'}
                    </Text>
                </Pressable>
            }
            contentStyle={styles.menuContent}
        >
            {options.map(optionValue => (
                <Menu.Item
                    key={optionValue}
                    onPress={() => {
                        setValue(optionValue);
                        setIsOpen(false);
                    }}
                    title={optionValue}
                    titleStyle={[
                        styles.optionText,
                        pickerStyle,
                        optionValue === value && styles.optionTextSelected,
                    ]}
                    style={[
                        styles.option,
                        optionValue === value && styles.optionSelected,
                    ]}
                />
            ))}
        </Menu>
    </View>
)};

export default function MonthDropdown({ style, pickerStyle }: DropdownProps) {
const monthOptions = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));

return (
    <NumberDropdown
        style={style}
        pickerStyle={pickerStyle}
        options={monthOptions}
        initialValue="01"
    />
)};

export function YearDropdown({ style, pickerStyle }: DropdownProps) {
const yearOptions = Array.from({ length: 12 }, (_, i) => String(2026 + i));

return (
    <NumberDropdown
        style={style}
        pickerStyle={pickerStyle}
        options={yearOptions}
        initialValue="2026"
    />
)};

const styles = StyleSheet.create({
    container: {
        width: '100%',
    },
    trigger: {
        minHeight: 50,
        borderWidth: 1,
        borderColor: '#000',
        borderRadius: 5,
        paddingHorizontal: 12,
        justifyContent: 'center',
        backgroundColor: '#fff',
    },
    triggerText: {
        fontSize: 14,
        color: '#111',
    },
    menuContent: {
        backgroundColor: '#fff',
    },
    option: {
        marginHorizontal: 4,
        borderRadius: 4,
        backgroundColor: '#fff',
    },
    optionSelected: {
        backgroundColor: '#2563EB',
    },
    optionText: {
        color: '#111',
    },
    optionTextSelected: {
        color: '#fff',
        fontWeight: '600',
    },
});