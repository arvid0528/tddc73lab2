import React from 'react';
import { View, Text, TextInput, StyleSheet, Button, Pressable, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Menu } from 'react-native-paper';
import Animated, { 
    SlideOutUp, 
    SlideInDown, 
    FlipInYRight, 
    FlipOutYLeft,
    useSharedValue,
    useAnimatedStyle,
    interpolate,
    withTiming
} from 'react-native-reanimated';

const CARD_LOGOS = {
    visa: require('./assets/visa.png'),
    mastercard: require('./assets/mastercard.png'),
    amex: require('./assets/amex.png'),
    discover: require('./assets/discover.png'),
    jcb: require('./assets/jcb.png'),
    unionpay: require('./assets/unionpay.png'),
    dinersclub: require('./assets/dinersclub.png'),
    troy: require('./assets/troy.png'),
} as const;

const CARD_BACKGROUNDS = [
    require('./assets/1.jpeg'),
    require('./assets/2.jpeg'),
    require('./assets/3.jpeg'),
    require('./assets/4.jpeg'),
    require('./assets/5.jpeg'),
    require('./assets/6.jpeg'),
    require('./assets/7.jpeg'),
    require('./assets/8.jpeg'),
    require('./assets/9.jpeg'),
    require('./assets/10.jpeg'),
    require('./assets/11.jpeg'),
    require('./assets/12.jpeg'),
    require('./assets/13.jpeg'),
    require('./assets/14.jpeg'),
    require('./assets/15.jpeg'),
    require('./assets/16.jpeg'),
    require('./assets/17.jpeg'),
    require('./assets/18.jpeg'),
    require('./assets/19.jpeg'),
    require('./assets/20.jpeg'),
    require('./assets/21.jpeg'),
    require('./assets/22.jpeg'),
    require('./assets/23.jpeg'),
    require('./assets/24.jpeg'),
    require('./assets/25.jpeg'),
] as const;

type CardType = keyof typeof CARD_LOGOS;

const detectCardType = (cardNumber: string): CardType => {
    if (/^4/.test(cardNumber)) return 'visa';
    if (/^(34|37)/.test(cardNumber)) return 'amex';
    if (/^5[1-5]/.test(cardNumber)) return 'mastercard';
    if (/^6011/.test(cardNumber)) return 'discover';
    if (/^9792/.test(cardNumber)) return 'troy';
    if (/^(3528|3589)/.test(cardNumber)) return 'jcb';
    if (/^(62|60)/.test(cardNumber)) return 'unionpay';
    if (/^(30[0-5]|36|38|39)/.test(cardNumber)) return 'dinersclub';
    return 'visa';
};

const formatCardNumber = (cardNumber: string, cardType: CardType) => {
    if (cardType === 'amex') {
        const paddedNumber = cardNumber.slice(0, 15).padEnd(15, '#');
        return paddedNumber.replace(/(.{4})(.{6})(.{5})/, '$1 $2 $3');
    }

    const paddedNumber = cardNumber.slice(0, 16).padEnd(16, '#');
    return paddedNumber.replace(/(.{4})/g, '$1 ').trim();
};

const formatCardNumberInput = (cardNumber: string, cardType: CardType) => {
    // Removes letters and adds spaces to the card number input
    const digits = cardNumber
        .replace(/\D/g, '')
        .slice(0, cardType === 'amex' ? 15 : 16);

    if (cardType === 'amex') {
        const parts = [digits.slice(0, 4), digits.slice(4, 10), digits.slice(10, 15)].filter(Boolean);
        return parts.join(' ');
    }

    return digits.match(/.{1,4}/g)?.join(' ') ?? '';
};

const getRandomCardBackground = () => {
    const randomIndex = Math.floor(Math.random() * CARD_BACKGROUNDS.length);
    return CARD_BACKGROUNDS[randomIndex];
};

const preloadCardBackgrounds = async () => {
    const preloadTasks = CARD_BACKGROUNDS
        .map(background => Image.resolveAssetSource(background)?.uri)
        .filter((uri): uri is string => Boolean(uri))
        .map(uri => Image.prefetch(uri));

    await Promise.all(preloadTasks);
};


export default function MainScreen() {
    const [focusedField, setFocusedField] = React.useState<string | null>(null);
    const [openMenu, setOpenMenu] = React.useState<'month' | 'year' | null>(null);
    const [warmupMenuVisible, setWarmupMenuVisible] = React.useState(true);
    const [month, setMonth] = React.useState('');
    const [year, setYear] = React.useState('');
    const [cvv, setCvv] = React.useState('');
    const [cardNumber, setCardNumber] = React.useState('');
    const [formattedCardNumber, setFormattedCardNumber] = React.useState('#### #### #### ####');
    const [cardHolder, setCardHolder] = React.useState('');
    const [cardHolderFormatted, setCardHolderFormatted] = React.useState('FULL NAME');
    const [cardType, setCardType] = React.useState<CardType>('visa');
    const [cardBackground, setCardBackground] = React.useState(getRandomCardBackground());

    const handleCardNumberChange = (text: string) => {
        const cleanedText = text.replace(/\D/g, '');
        const detectedType = detectCardType(cleanedText);
        const normalizedNumber = cleanedText.slice(0, detectedType === 'amex' ? 15 : 16);

        setCardNumber(normalizedNumber);
        setCardType(detectedType);
        setFormattedCardNumber(formatCardNumber(normalizedNumber, detectedType));

    }

    const handleCardHolderChange = (text: string) => {
        setCardHolder(text);
        if (text === '') {
            setCardHolderFormatted('FULL NAME');
        } else {
            const formattedText = text.toUpperCase();
            setCardHolderFormatted(formattedText);
        }
    }

    React.useEffect(() => {
        const frame = requestAnimationFrame(() => {
            setWarmupMenuVisible(false);
        });

        preloadCardBackgrounds().catch(() => {
            // Ignore preload failures
        });

        return () => cancelAnimationFrame(frame);
    }, []);

    const showMenu = (menu: 'month' | 'year') => {
        setOpenMenu(null);
        requestAnimationFrame(() => {
            setOpenMenu(menu);
        });
    };

    const focusCvv = () => {
        setFocusedField('cvv');
        flip.value = withTiming(1, { duration: 500 });
    }

    const unfocusCvv = () => {
        setFocusedField(null);
        flip.value = withTiming(0, { duration: 500 });
    }

    const resetStates = () => {
        setCardNumber('');
        setFormattedCardNumber(formatCardNumber('', 'visa'));
        setCardHolder('');
        setCardHolderFormatted('FULL NAME');
        setMonth('');
        setYear('');
        setCvv('');
        setCardType('visa');
        setCardBackground(getRandomCardBackground());
    }



    // 0 = front, 1 = back
    const flip = useSharedValue(0); 

    const frontStyle = useAnimatedStyle(() => ({
        transform: [
            { perspective: 1000 },
            { rotateY: `${interpolate(flip.value, [0, 1], [0, 180])}deg` },
        ],
    }));

    const backStyle = useAnimatedStyle(() => ({
        transform: [
            { perspective: 1000 },
            { rotateY: `${interpolate(flip.value, [0, 1], [180, 360])}deg` },
        ],
    }));

    return (
        <SafeAreaView style={styles.container}>
            <Menu
                visible={warmupMenuVisible}
                onDismiss={() => setWarmupMenuVisible(false)}
                anchor={{ x: -9999, y: -9999 }}
            >
                <Menu.Item title="warmup" onPress={() => setWarmupMenuVisible(false)} />
            </Menu>

            <View style={styles.cardContainer}>

                <Animated.View style={[styles.cardFrontFace, frontStyle]}>
                    <Image
                        source={cardBackground}
                        style={styles.cardImage}
                    />
                    <Animated.View style={styles.cardFrontFaceContent}>
                        <View style={styles.cardTopRow}>
                            <View style={styles.cardChip}>
                                <Image 
                                    source={require('./assets/chip.png')}
                                    style={{width: '100%', height: '100%', resizeMode: 'contain'}}
                                />
                            </View>
                            <View style={styles.cardLogo}>
                                <Image 
                                    source={CARD_LOGOS[cardType]}
                                    style={{width: '100%', height: '100%', resizeMode: 'contain'}}
                                />
                            </View>
                        </View>

                        <View style={styles.cardCardNumber}>
                            <View style={styles.cardNumberRow}>
                                {formattedCardNumber.split('').map((char, index) => {
                                    if (char === ' ') {
                                        return <View key={`space-${index}`} style={styles.cardDigitSpace} />;
                                    }

                                    return (
                                        <View key={`slot-${index}`} style={styles.cardDigitSlot}>
                                            <Animated.Text
                                                key={`char-${index}-${char}`}
                                                entering={SlideInDown.duration(300)}
                                                exiting={SlideOutUp.duration(300)}
                                                style={[styles.cardCardNumberText, styles.cardDigitText]}
                                            >
                                                {char}
                                            </Animated.Text>
                                        </View>
                                    );
                                })}
                            </View>
                        </View>
                        <View style={styles.cardBottomRow}>
                            <View style={styles.cardCardHolder}>
                                <Text style={styles.cardCardHolderLabel}>Card Holder</Text>
                                    
                                <View style={styles.cardCardHolderName}>

                                    {cardHolderFormatted.split('').map((char, index) => {
                                        return (
                                                <Animated.Text
                                                    key={'cardHolderChar-'+index}
                                                    entering={FlipInYRight.duration(300)}
                                                    exiting={FlipOutYLeft.duration(300)}
                                                    style={styles.cardCardHolderName}
                                                >
                                                    {char}
                                                </Animated.Text>
                                        );
                                    })}
                                </View>

                            </View>
                            <View style={styles.cardExpiry}>
                                <Text style={styles.cardExpiryLabel}>Expires</Text>
                                <Text style={styles.cardExpiryDate}>
                                    {month ? month : 'MM'}/{year ? year.slice(-2) : 'YY'}
                                </Text>
                            </View>
                        </View>
                    </Animated.View>
                </Animated.View>
                
                <Animated.View style={[styles.cardBackFace, backStyle]}>
                    <Image
                        source={cardBackground}
                        style={styles.cardImage}
                    />
                    <Animated.View style={styles.cardBackFaceContent}>
                        <View style={styles.cardBackBlackBar}>

                        </View>
                        <View style={styles.cardBackCvvContainer}>
                                <Text style={styles.cardBackCvvLabel}>
                                    CVV
                                </Text>
                                <View style={styles.cardBackCvvField}>
                                    <Text style={styles.cardBackCvvText}>
                                        {cvv ? cvv : ''}
                                    </Text>
                                </View>
                                <View style={styles.cardBackLogo}>
                                    <Image 
                                        source={CARD_LOGOS[cardType]}
                                        style={styles.logoImage}
                                    />
                                </View>
                        </View>
                    </Animated.View>    
                </Animated.View>



            </View>

            <View style={styles.formContainer}>

                <View style={{height: 120}}></View>

                <View style={[
                            styles.textFieldContainer,
                        ]}>
                    <Text>Card Number</Text>
                    <TextInput
                        onFocus={() => setFocusedField('cardNumber')}
                        onBlur={() => setFocusedField(null)}
                        onChangeText={handleCardNumberChange}
                        value={formatCardNumberInput(cardNumber, cardType)}
                        keyboardType="number-pad"
                        autoComplete='off'
                        maxLength={cardType === 'amex' ? 17 : 19}
                        style={[
                            styles.textInput,
                            focusedField === 'cardNumber' && styles.inputFocused,
                        ]}
                    />
                </View>

                <View style={[
                            styles.textFieldContainer,
                        ]}>
                    <Text>Card Holder</Text>
                    <TextInput
                        onFocus={() => {setFocusedField('cardHolder')}}
                        onBlur={() => setFocusedField(null)}
                        onChangeText={handleCardHolderChange}
                        value={cardHolder}
                        style={[
                            styles.textInput,
                            focusedField === 'cardHolder' && styles.inputFocused,
                        ]}
                    />
                    
                </View>

                <View style={styles.dateCvvRow}>
                    <View style={styles.dateCvvField}>
                        <Text>Exp. Date</Text>
                        <Menu 
                            visible={openMenu === 'month'}
                            onDismiss={() => setOpenMenu(null)}
                            anchor={
                                <View collapsable={false}>
                                    <Pressable 
                                        style={styles.monthPicker}
                                        onPress={() => showMenu('month')}>
                                        <Text>{month ? month : 'Month'}</Text>
                                        <Text>▼</Text>
                                    </Pressable>
                                </View>
                            }>
                            <Menu.Item title="01" onPress={() => {setMonth('01'); setOpenMenu(null);}} />
                            <Menu.Item title="02" onPress={() => {setMonth('02'); setOpenMenu(null);}} />
                            <Menu.Item title="03" onPress={() => {setMonth('03'); setOpenMenu(null);}} />
                            <Menu.Item title="04" onPress={() => {setMonth('04'); setOpenMenu(null);}} />
                            <Menu.Item title="05" onPress={() => {setMonth('05'); setOpenMenu(null);}} />
                            <Menu.Item title="06" onPress={() => {setMonth('06'); setOpenMenu(null);}} />
                            <Menu.Item title="07" onPress={() => {setMonth('07'); setOpenMenu(null);}} />
                            <Menu.Item title="08" onPress={() => {setMonth('08'); setOpenMenu(null);}} />
                            <Menu.Item title="09" onPress={() => {setMonth('09'); setOpenMenu(null);}} />
                            <Menu.Item title="10" onPress={() => {setMonth('10'); setOpenMenu(null);}} />
                            <Menu.Item title="11" onPress={() => {setMonth('11'); setOpenMenu(null);}} />
                            <Menu.Item title="12" onPress={() => {setMonth('12'); setOpenMenu(null);}} />
                        </Menu>
                    </View>

                    <View style={styles.dateCvvField}>
                        <Menu 
                            visible={openMenu === 'year'}
                            onDismiss={() => setOpenMenu(null)}
                            anchor={
                                <View collapsable={false}>
                                    <Pressable 
                                        style={styles.monthPicker}
                                        onPress={() => showMenu('year')}>
                                        <Text>{year ? year : 'Year'}</Text>
                                        <Text>▼</Text>
                                    </Pressable>
                                </View>
                            }>
                            <Menu.Item title="2026" onPress={() => {setYear('2026'); setOpenMenu(null);}} />
                            <Menu.Item title="2027" onPress={() => {setYear('2027'); setOpenMenu(null);}} />
                            <Menu.Item title="2028" onPress={() => {setYear('2028'); setOpenMenu(null);}} />
                            <Menu.Item title="2029" onPress={() => {setYear('2029'); setOpenMenu(null);}} />
                            <Menu.Item title="2030" onPress={() => {setYear('2030'); setOpenMenu(null);}} />
                            <Menu.Item title="2031" onPress={() => {setYear('2031'); setOpenMenu(null);}} />
                            <Menu.Item title="2032" onPress={() => {setYear('2032'); setOpenMenu(null);}} />
                            <Menu.Item title="2033" onPress={() => {setYear('2033'); setOpenMenu(null);}} />
                            <Menu.Item title="2034" onPress={() => {setYear('2034'); setOpenMenu(null);}} />
                            <Menu.Item title="2035" onPress={() => {setYear('2035'); setOpenMenu(null);}} />
                            <Menu.Item title="2036" onPress={() => {setYear('2036'); setOpenMenu(null);}} />
                            <Menu.Item title="2037" onPress={() => {setYear('2037'); setOpenMenu(null);}} />
                        </Menu>
                    </View>

                    <View style={styles.dateCvvField}>
                        <Text>CVV</Text>
                        <TextInput 
                            onFocus={focusCvv}
                            onBlur={unfocusCvv}
                            style={[
                                styles.textInput, 
                                styles.dateCvvInput,
                                focusedField === 'cvv' && styles.inputFocused
                            ]} 
                            value={cvv}
                            keyboardType="numeric" 
                            onChangeText={(text) => setCvv(text.replace(/[^0-9]/g, ''))}
                            maxLength={4} 
                        />
                    </View>
                </View>

                <View style={styles.submitButtonContainer}>
                    <Button title="Submit" onPress={resetStates} />
                </View>
            </View>


        </SafeAreaView>
    );
    }

const styles = StyleSheet.create({
    container: {  
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
        backgroundColor: '#ccf'
    },
    cardContainer: {
        position: 'absolute',
        top: '5%',
        zIndex: 1,
        width: '70%',
        aspectRatio: 1.6,
        borderRadius: 20,
    },
    cardImage: {
        position: 'absolute',
        zIndex: 2,
        width: '100%',
        height: '100%',
        borderRadius: 10,
        boxShadow: '0 0 50px rgba(0, 0, 0, 0.6)',
    },
    cardFrontFace: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        backfaceVisibility: 'hidden',
    },
    cardFrontFaceContent: {
        position: 'absolute',
        zIndex: 3,
        flexDirection: 'column',
        justifyContent: 'space-between',
        width: '100%',
        height: '100%',
    },
    cardBackFace: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        backfaceVisibility: 'hidden',
    },
    cardBackFaceContent: {
        position: 'absolute',
        zIndex: 3,
        flexDirection: 'column',
        justifyContent: 'flex-start',
        width: '100%',
        height: '100%',
    },
    cardBackBlackBar: {
        marginTop: 10,
        width: '100%',
        height: '20%',
        backgroundColor: '#000',
    },
    cardBackCvvContainer: {
        marginTop: 10,
        flexDirection: 'column',
        justifyContent: 'flex-start',
        width: '90%',
        marginLeft: '5%',
        height: '30%',
    },
    cardBackCvvLabel: {
        color: '#fff',
        marginRight: 10,
        fontSize: 10,
        width: '100%',
        height: '25%',
        textAlign: 'right',
        marginBottom: 5,
    },
    cardBackCvvField: {
        backgroundColor: '#fff',
        borderRadius: 3,
        width: '100%',
        height: '70%',
        justifyContent: 'center',
    },
    cardBackCvvText: {
        fontSize: 16,
        marginLeft: 10,
    },
    cardBackLogo: {
        width: 50,
        alignSelf: 'flex-end',
    },
    logoImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'contain',
    },
    cardTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        width: '100%',
        height: '30%',
        padding: 0,
    },
    cardChip: {
        marginLeft: 10,
        width: 40,
    },
    cardLogo: {
        marginRight: 10,
        width: 50,
    },
    cardCardNumber: {
        marginLeft: 10,
    },
    cardNumberRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    cardDigitSlot: {
        width: 11,
        height: 22,
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardDigitSpace: {
        width: 8,
    },
    cardDigitText: {
        textAlign: 'center',
    },
    cardCardNumberText: {
        fontSize: 18,
        color: '#fff',
        fontFamily: 'monospace',
    },
    cardBottomRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    cardCardHolder: {
        flexDirection: 'column',
        marginLeft: 10,
        marginBottom: 10,
    },
    cardCardHolderLabel: {
        fontSize: 12,
        color: '#ccc',
    },
    cardCardHolderName: {
        flexDirection: 'row',
        fontSize: 14,
        color: '#fff',
    },
    cardExpiry: {
        flexDirection: 'column',
        marginRight: 10,
        marginBottom: 10,
        width: 50,
        alignItems: 'center',
    },
    cardExpiryLabel: {
        fontSize: 12,
        color: '#ccc',
    },
    cardExpiryDate: {
        fontSize: 14,
        color: '#fff',
        fontFamily: 'monospace',
    },
    formContainer: {
        backgroundColor: '#fff',
        width: '90%',
        height: '85%',
        elevation: 20,
        borderRadius: 20,
        justifyContent: 'flex-start',
    },
    textFieldContainer: {
        flexDirection: 'column',
        alignItems: 'flex-start',
        marginLeft: '5%',
        marginBottom: 20,
        width: '100%',
    },
    containerFocused: {
        elevation: 20,
    },
    inputFocused: {
        boxShadow: '0 0 20px rgba(0, 0, 0, 0.2)',
        borderColor: '#55f',
    },
    textInput: {
        borderWidth: 1,
        borderColor: '#000',
        borderRadius: 5,
        width: '90%',
        marginRight: '5%',
    },
    dateCvvRow: {
        flexDirection: 'row',
        marginLeft: '5%',
        marginRight: '5%',
        gap: '5%',
    },
    dateCvvField: {
        flex: 1,
        alignItems: 'stretch',
        justifyContent: 'flex-end',
    },
    monthPicker: {
        width: '100%',
        borderWidth: 1,
        borderColor: '#000',
        borderRadius: 5,
        height: 50,
        fontSize: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 5,
    },
    dropdownControl: {
        width: '100%',
        height: 50,
        fontSize: 14,
    },
    yearDropdownControl: {
        width: '100%',
        height: 50,
        fontSize: 13,
    },
    dateCvvInput: {
        width: '100%',
        height: 50,
    },
    submitButtonContainer: {
        marginLeft: '5%',
        marginRight: '5%',
        marginTop: 20,
        boxShadow: '0 0 20px rgba(0, 0, 0, 0.2)',
        marginBottom: 20,
    },
});