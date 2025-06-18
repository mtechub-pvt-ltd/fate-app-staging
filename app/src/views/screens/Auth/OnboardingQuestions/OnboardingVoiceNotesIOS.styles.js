import { StyleSheet, Platform } from 'react-native';
import { responsiveHeight, responsiveWidth, responsiveFontSize } from 'react-native-responsive-dimensions';
import COLORS from '../../../../consts/colors';
import fonts from '../../../../consts/fonts';

export default StyleSheet.create({
    loadingOverlay: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        left: responsiveHeight(0),
        top: responsiveHeight(0),
        zIndex: 999,
        width: responsiveWidth(100),
        height: responsiveHeight(100),
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    safeArea: {
        padding: Platform.OS === 'ios' ? 20 : 0,
        flex: 1,
    },
    keyboardAvoidingView: {
        flex: 1,
    },
    container: {
        flex: 1,
    },
    scrollViewContent: {
        flexGrow: 1,
    },
    topBarContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignContent: 'center',
        alignItems: 'center',
    },
    resetButton: {
        padding: responsiveHeight(2),
    },
    resetText: {
        color: COLORS.white,
        fontSize: responsiveFontSize(2),
        fontFamily: fonts.PoppinsRegular,
    },
    titleContainer: {
        marginTop: responsiveHeight(2),
        marginLeft: responsiveWidth(3),
        width: responsiveWidth(85),
    },
    textInput: {
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        width: responsiveWidth(90),
        padding: responsiveHeight(2),
        borderRadius: 20,
        marginTop: responsiveHeight(4),
        borderColor: 'rgba(255, 255, 255, 0.24)',
        borderWidth: 1,
        color: 'white',
        fontSize: responsiveFontSize(2),
        height: Platform.OS === 'ios' ? responsiveHeight(15) : 'auto',
        alignSelf: 'center',
    },
    recordingContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        flex: 0.7,
    },
    recordButton: {
        padding: responsiveHeight(3),
        borderRadius: 15,
        justifyContent: 'center',
        flexDirection: 'column',
        alignItems: 'center',
    },
    recordingText: {
        color: COLORS.white,
        fontSize: responsiveFontSize(2),
        fontWeight: 'bold',
        marginVertical: responsiveHeight(2),
        fontFamily: fonts.PoppinsRegular,
    },
    tapToTalkText: {
        color: COLORS.white,
        fontSize: responsiveFontSize(2),
        fontWeight: '500',
        marginTop: responsiveHeight(1),
        fontFamily: fonts.PoppinsRegular,
    },
    audioPlayerContainer: {
        position: 'relative',
        width: responsiveWidth(90),
        height: 120,
        marginTop: responsiveHeight(4),
    },
    finishButtonContainer: {
        alignContent: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
        padding: responsiveHeight(1),
    },
    finishButton: {
        width: responsiveWidth(90),
        backgroundColor: COLORS.white,
    },
    hidden: {
        display: 'none',
    },
});
