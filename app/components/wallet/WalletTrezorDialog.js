// @flow
// FIXME : Better Logging overall
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import { defineMessages, intlShape } from 'react-intl';
import TrezorConnect, { UI, UI_EVENT, DEVICE, DEVICE_EVENT } from 'trezor-connect';
import type { DeviceMessage } from 'trezor-connect';
import { CONNECT, CONNECT_UNACQUIRED, DISCONNECT, CHANGED, ACQUIRE, RELEASE, ACQUIRED, RELEASED} from '../../../node_modules/trezor-connect/lib/constants/device';
import { CLOSE_UI_WINDOW } from '../../../node_modules/trezor-connect/lib/constants/ui';
import type { CardanoGetPublicKey, UiMessage, Features, Device } from '../../../node_modules/trezor-connect/lib/types';

import DialogCloseButton from '../widgets/DialogCloseButton';
import Dialog from '../widgets/Dialog';
import Button from 'react-polymorph/lib/components/Button';
import SimpleButtonSkin from 'react-polymorph/lib/skins/simple/raw/ButtonSkin';

import globalMessages from '../../i18n/global-messages';
import LocalizableError from '../../i18n/LocalizableError';
import styles from './WalletTrezorDialog.scss';

import SvgInline from 'react-svg-inline';
import externalLinkSVG from '../../assets/images/link-external.inline.svg';
import aboutPrerequisiteIconSVG from '../../assets/images/trezor/about-prerequisite-header-icon.inline.svg';
import aboutPrerequisiteTrezorSVG from '../../assets/images/trezor/about-trezor.inline.svg';
import connectLoadGIF from '../../assets/images/trezor/connect-load.gif';
import connectStartGIF from '../../assets/images/trezor/connect-start.gif';
import connectErrorSVG from '../../assets/images/trezor/connect-error.inline.svg';
import saveLoadGIF from '../../assets/images/trezor/save-load.inline.svg';
import saveStartSVG from '../../assets/images/trezor/save-start.inline.svg';
import saveErrorSVG from '../../assets/images/trezor/save-error.inline.svg';
import saveSuccessSVG from '../../assets/images/trezor/save-success.inline.svg';

import ReactToolboxMobxForm from '../../utils/ReactToolboxMobxForm';
import { isValidHardwareWalletName } from '../../utils/validations';
import Input from 'react-polymorph/lib/components/Input';
import SimpleInputSkin from 'react-polymorph/lib/skins/simple/raw/InputSkin';
import ProgressSteps from '../widgets/ProgressSteps';
import DialogBackButton from '../widgets/DialogBackButton';

const messages = defineMessages({
  title: {
    id: 'wallet.trezor.dialog.title.label',
    defaultMessage: '!!!Connect to Trezor Hardware Wallet',
    description: 'Label "Connect to Trezor Hardware Wallet" on the Connect to Trezor Hardware Wallet dialog.'
  },
  stepAboutLabel:{
    id: 'wallet.trezor.dialog.trezor.step.about.label',
    defaultMessage: '!!!ABOUT',
    description: 'Progress Step Label "About" on the Connect to Trezor Hardware Wallet dialog.'
  },
  stepConnectLabel:{
    id: 'wallet.trezor.dialog.trezor.step.connect.label',
    defaultMessage: '!!!CONNECT',
    description: 'Progress Step Label "Connect" on the Connect to Trezor Hardware Wallet dialog.'
  },
  stepSaveLabel:{
    id: 'wallet.trezor.dialog.trezor.step.save.label',
    defaultMessage: '!!!SAVE',
    description: 'Progress Step Label "Save" on the Connect to Trezor Hardware Wallet dialog.'
  },  
  nextButtonLabel: {
    id: 'wallet.trezor.dialog.trezor.next.button.label',
    defaultMessage: '!!!Next',
    description: 'Label for the "Next" button on the Connect to Trezor Hardware Wallet dialog.'
  },  
  connectButtonLabel: {
    id: 'wallet.trezor.dialog.trezor.connect.button.label',
    defaultMessage: '!!!Connect',
    description: 'Label for the "Connect" button on the Connect to Trezor Hardware Wallet dialog.'
  },
  saveButtonLabel: {
    id: 'wallet.trezor.dialog.trezor.save.button.label',
    defaultMessage: '!!!Save',
    description: 'Label for the "Save" button on the Connect to Trezor Hardware Wallet dialog.'
  },
  aboutIntroTextLine1: {
    id: 'wallet.trezor.dialog.trezor.step.about.introText.line.1',
    defaultMessage: '!!!A hardware wallet is a small USB device that adds an extra level of security to your wallet.',
    description: 'Header text of about step on the Connect to Trezor Hardware Wallet dialog.'
  },
  aboutIntroTextLine2: {
    id: 'wallet.trezor.dialog.trezor.step.about.introText.line.2',
    defaultMessage: '!!!It is more secure because your private key never leaves the hardware wallet.',
    description: 'Header text of about step on the Connect to Trezor Hardware Wallet dialog.'
  },
  aboutIntroTextLine3: {
    id: 'wallet.trezor.dialog.trezor.step.about.introText.line.3',
    defaultMessage: '!!!Protects your funds when using a computer compromised with viruses, phishing attempts, malware and others.',
    description: 'Header text of about step on the Connect to Trezor Hardware Wallet dialog.'
  },
  aboutPrerequisiteHeader: {
    id: 'wallet.trezor.dialog.trezor.step.about.prerequisite.header',
    defaultMessage: '!!!Prerequisites',
    description: 'Prerequisite header on the Connect to Trezor Hardware Wallet dialog.'
  },
  aboutPrerequisite1Part1: {
    id: 'wallet.trezor.dialog.trezor.step.about.prerequisite.1.part1',
    defaultMessage: '!!!Only Supports',
    description: 'First Prerequisite on the Connect to Trezor Hardware Wallet dialog.'
  },
  aboutPrerequisite1Part2Link: {
    id: 'wallet.trezor.dialog.trezor.step.about.prerequisite.1.part2.link',
    defaultMessage: '!!!https://github.com/trezor/trezor-core/blob/master/ChangeLog',
    description: 'First Prerequisite on the Connect to Trezor Hardware Wallet dialog.'
  },
  aboutPrerequisite1Part2LinkText: {
    id: 'wallet.trezor.dialog.trezor.step.about.prerequisite.1.part2.link.text',
    defaultMessage: '!!!Trezor Model T with version 2.0.8',
    description: 'First Prerequisite on the Connect to Trezor Hardware Wallet dialog.'
  },
  aboutPrerequisite1Part3: {
    id: 'wallet.trezor.dialog.trezor.step.about.prerequisite.1.part3',
    defaultMessage: '!!!or later',
    description: 'First Prerequisite on the Connect to Trezor Hardware Wallet dialog.'
  },      
  aboutPrerequisite2: {
    id: 'wallet.trezor.dialog.trezor.step.about.prerequisite.2',
    defaultMessage: '!!!Trezor device must be pre-initialized',
    description: 'Second Prerequisite on the Connect to Trezor Hardware Wallet dialog.'
  },
  aboutPrerequisite3: {
    id: 'wallet.trezor.dialog.trezor.step.about.prerequisite.3',
    defaultMessage: '!!!The computer needs to be connected to the Internet throughout the process',
    description: 'Third Prerequisite on the Connect to Trezor Hardware Wallet dialog.'
  },
  aboutPrerequisite4: {
    id: 'wallet.trezor.dialog.trezor.step.about.prerequisite.4',
    defaultMessage: '!!!Only one Trezor device can be connected to the computer at any time',
    description: 'Fourth Prerequisite on the Connect to Trezor Hardware Wallet dialog.'
  },
  aboutPrerequisite5: {
    id: 'wallet.trezor.dialog.trezor.step.about.prerequisite.5',
    defaultMessage: '!!!Trezor device screen must be unlocked',
    description: 'Fifth Prerequisite on the Connect to Trezor Hardware Wallet dialog.'
  },
  aboutPrerequisite6: {
    id: 'wallet.trezor.dialog.trezor.step.about.prerequisite.6',
    defaultMessage: '!!!Trezor device must remain connected to the computer throughout the process',
    description: 'Sixth Prerequisite on the Connect to Trezor Hardware Wallet dialog.'
  },
  helpLinkYoroiWithTrezor: {
    id: 'wallet.trezor.dialog.trezor.common.step.link.helpYoroiWithTrezor',
    defaultMessage: '!!!https://yoroi-wallet.com/',
    description: 'Tutorial link about how to use Yoroi with Trezor on the Connect to Trezor Hardware Wallet dialog.'
  },
  helpLinkYoroiWithTrezorText: {
    id: 'wallet.trezor.dialog.trezor.common.step.link.helpYoroiWithTrezor.text',
    defaultMessage: '!!!Click here to know more about how to use Yoroi with Trezor.',
    description: 'Tutorial link text about how to use Yoroi with Trezor on the Connect to Trezor Hardware Wallet dialog.'
  },  
  connectIntroTextLine1: {
    id: 'wallet.trezor.dialog.trezor.step.connect.introText.line.1',
    defaultMessage: '!!!After connecting your Trezor device to the computer press the Connect button.',
    description: 'Header text of about step on the Connect to Trezor Hardware Wallet dialog.'
  },
  connectIntroTextLine2: {
    id: 'wallet.trezor.dialog.trezor.step.connect.introText.line.2',
    defaultMessage: '!!!A new tab will appear, please follow the instructions in the new tab.',
    description: 'Header text of about step on the Connect to Trezor Hardware Wallet dialog.'
  },
  connectIntroTextLine3: {
    id: 'wallet.trezor.dialog.trezor.step.connect.introText.line.3',
    defaultMessage: '!!!This process shares the Cardano public key with Yoroi.',
    description: 'Header text of about step on the Connect to Trezor Hardware Wallet dialog.'
  },
  connectLiveMessageCheckingTrezorDevice: {
    id: 'wallet.trezor.dialog.trezor.step.connect.liveMessage.checkingTrezorDevice',
    defaultMessage: '!!!Checking Trezor device, please follow the instructions on the new tab...',
    description: 'Live message about checking Trezor device of connect start step on the Connect to Trezor Hardware Wallet dialog.'
  },
  connectError1001: {
    id: 'wallet.trezor.dialog.trezor.step.connect.error.1001',
    defaultMessage: '!!!ERROR#1001: Could not connect to the Internet, please retry.',
    description: '\"ERROR#1001: Could not connect to the Internet, please retry\" on the Connect to Trezor Hardware Wallet dialog.'
  },
  connectError1002: {
    id: 'wallet.trezor.dialog.trezor.step.connect.error.1002',
    defaultMessage: '!!!ERROR#1002: Something unexpected happened, please retry.',
    description: '\"ERROR#1002: Something unexpected happened, please retry.\" on the Connect to Trezor Hardware Wallet dialog.'
  },
  connectError2001: {
    id: 'wallet.trezor.dialog.trezor.step.connect.error.2001',
    defaultMessage: '!!!ERROR#2001: Necessary permissions were not granted by the user, please retry.',
    description: '\"ERROR#2001: Necessary permissions were not granted by the user, please retry.\" on the Connect to Trezor Hardware Wallet dialog.'
  },
  connectError2002: {
    id: 'wallet.trezor.dialog.trezor.step.connect.error.2002',
    defaultMessage: '!!!ERROR#2002: Cancelled, please retry',
    description: '\"ERROR#2002: Cancelled, please retry\" on the Connect to Trezor Hardware Wallet dialog.'
  },      
  saveWalletNameInputLabel: {
    id: 'wallet.trezor.dialog.trezor.step.save.walletName.label',
    defaultMessage: '!!!Wallet name',
    description: 'Label for the wallet name input on the Connect to Trezor Hardware Wallet dialog.'
  },  
  saveWalletNameInputPlaceholder: {
    id: 'wallet.restore.dialog.wallet.name.input.hint',
    defaultMessage: '!!!Enter wallet name',
    description: 'Placeholder "Enter wallet name" for the wallet name input on the wallet restore dialog.'
  },
  saveWalletNameInputBottomInfo: {
    id: 'wallet.trezor.dialog.trezor.step.save.walletName.info',
    defaultMessage: '!!!We have fetched Trezor device’s name for you; you can use as it is or assign a different name.',
    description: 'Hint for the wallet name input on the wallet restore dialog.'
  },  
});

messages.fieldIsRequired = globalMessages.fieldIsRequired;

type ProgressState = 'ABOUT' | 'CONNECT_LOAD' | 'CONNECT_START' | 'CONNECT_ERROR' | 'SAVE_LOAD' | 'SAVE_START' | 'SAVE_ERROR';
const ProgressStateOption = {
  // ABOUT Page
  'ABOUT': 'ABOUT',
  // CONNECT Page
  'CONNECT_LOAD': 'CONNECT_LOAD',
  'CONNECT_START': 'CONNECT_START',
  'CONNECT_ERROR': 'CONNECT_ERROR',
  // SAVE Page
  'SAVE_LOAD': 'SAVE_LOAD',
  'SAVE_START': 'SAVE_START',
  'SAVE_ERROR': 'SAVE_ERROR',
};

type TrezorDeviceInfo = {
  valid: boolean;
  errorId: string,
  cardanoGetPublicKeyResult: CardanoGetPublicKey, // Trezor device CardanoGetPublicKey object
  features: Features
};

type Props = {
  isSubmitting: boolean,
  onSubmit: Function,
  onCancel: Function,
  error?: ?LocalizableError,
};

type State = {
  isSubmitting?: boolean, // FIXME : remove duplicate
  currentProgressStepInfo: {
    currentIndex: 0 | 1 | 2,
    error: boolean
  },
  action_btn_name?: string,
  action_btn_processing? : boolean,
  error_or_live_info_text? : string,
}

@observer
export default class WalletTrezorDialog extends Component<Props, State> {

  static contextTypes = {
    intl: intlShape.isRequired
  };

  // progress state of this dialog
  progressState: ProgressState;
  // device info which will be used to create wallet (except wallet name)
  // wallet name will be fetched from user using form
  trezorDeviceInfo: TrezorDeviceInfo;
  // Trezor device DeviceMessage event object
  trezorEventDevice: DeviceMessage;
  // form for wallet name
  form : typeof ReactToolboxMobxForm;

  constructor(props: Props) {
    super(props);
    this._init();
  }

  _init() {
    this.progressState = ProgressStateOption.ABOUT;
    this.state = {
      currentProgressStepInfo: {
        currentIndex: 0,
        error: false
      }
    };
  }

  componentWillMount() {
    const { intl } = this.context;
    // FIXME : it is used only in 'SAVE_LOAD' | 'SAVE_START' | 'SAVE_ERROR, how about initializing at that moment  
    this.form = new ReactToolboxMobxForm({
      fields: {
        walletName: {
          label: intl.formatMessage(messages.saveWalletNameInputLabel),
          placeholder: intl.formatMessage(messages.saveWalletNameInputPlaceholder),
          value: '',
          validators: [({ field }) => (
            [
              isValidHardwareWalletName(field.value),
              intl.formatMessage(globalMessages.invalidHardwareWalletName)
            ]
          )],
        },
      },
    }, {
      options: {
        validateOnChange: true,
        validationDebounceWait: 250,
      },
    });
    this._updateState();
  }

  /**
   * prepares and updates the UI state
   */
  _updateState = async () => {
    const { intl } = this.context;

    switch(this.progressState) {
      case ProgressStateOption.ABOUT:
        this.state.currentProgressStepInfo.currentIndex = 0;
        this.state.currentProgressStepInfo.error = false;
        this.state.action_btn_processing = false;
        this.state.action_btn_name = intl.formatMessage(messages.nextButtonLabel);
        this.state.error_or_live_info_text = '';
        break;      
      case ProgressStateOption.CONNECT_LOAD:
        this.state.currentProgressStepInfo.currentIndex = 1;
        this.state.currentProgressStepInfo.error = false;
        this.state.action_btn_processing = false;
        this.state.action_btn_name = intl.formatMessage(messages.connectButtonLabel);
        this.state.error_or_live_info_text = '';
        break;
      case ProgressStateOption.CONNECT_START:
        this.state.currentProgressStepInfo.currentIndex = 1;
        this.state.currentProgressStepInfo.error = false;        
        this.state.action_btn_processing = true;
        this.state.error_or_live_info_text = intl.formatMessage(messages.connectLiveMessageCheckingTrezorDevice);
        this.state.action_btn_name = intl.formatMessage(messages.connectButtonLabel);
        break;
      case ProgressStateOption.CONNECT_ERROR:
        this.state.currentProgressStepInfo.currentIndex = 1;
        this.state.currentProgressStepInfo.error = true;
        this.state.action_btn_processing = false;
        this.state.error_or_live_info_text = intl.formatMessage(messages[this.trezorDeviceInfo.errorId]);
        this.state.action_btn_name = intl.formatMessage(messages.connectButtonLabel);
        break;        
      case ProgressStateOption.SAVE_LOAD:
        this.state.currentProgressStepInfo.currentIndex = 2;
        this.state.currentProgressStepInfo.error = false;
        this.state.action_btn_processing = false;
        this.form.$('walletName').value = this.trezorDeviceInfo.features.label;
        this.state.error_or_live_info_text = '';
        this.state.action_btn_name = intl.formatMessage(messages.saveButtonLabel);
        break;
       case ProgressStateOption.SAVE_START:
         this.state.currentProgressStepInfo.currentIndex = 2;
         this.state.currentProgressStepInfo.error = false;
        this.state.action_btn_processing = true;
        this.state.error_or_live_info_text = '';
        this.state.action_btn_name = intl.formatMessage(messages.saveButtonLabel);
        break;
      case ProgressStateOption.SAVE_ERROR:
        this.state.currentProgressStepInfo.currentIndex = 2;
        this.state.currentProgressStepInfo.error = true;
        this.state.action_btn_processing = false;
        this.state.error_or_live_info_text = '';
        this.state.action_btn_name = intl.formatMessage(messages.saveButtonLabel);
        break;                       
      default:
        console.error(`Error state, handle _updateState for : ${this.progressState}`);
        break;
    }
    this.setState({});
  }  

  render() {
    // FIXME: better component division
    const { intl } = this.context;
    const { isSubmitting, error, onCancel } = this.props;

    const progressStep = (<ProgressSteps
      stepsList={[
        intl.formatMessage(messages.stepAboutLabel),
        intl.formatMessage(messages.stepConnectLabel),
        intl.formatMessage(messages.stepSaveLabel)        
      ]}
      progressInfo={this.state.currentProgressStepInfo}
    />);

    const walletNameFieldClasses = classnames([
      'walletName',
      styles.walletName,
    ]);
    const walletNameField = this.form.$('walletName');    

    let dialog = null;

    if(this.progressState === ProgressStateOption.ABOUT) {
      const actions = [{
        className: this.state.action_btn_processing ? styles.isProcessing : null,
        label: this.state.action_btn_name,
        primary: true,
        disabled: this.state.action_btn_processing,
        onClick: this.onNext
      }];
      dialog = (
        <Dialog
          className={classnames([styles.component, 'WalletTrezorDialog'])}
          title={intl.formatMessage(messages.title)}
          closeOnOverlayClick={false}
          onClose={onCancel}
          actions={actions}
          closeButton={<DialogCloseButton />}
        >
        {progressStep}
        <div className={styles.headerComponent}>
          <span>{intl.formatMessage(messages.aboutIntroTextLine1)}</span><br/>
          <span>{intl.formatMessage(messages.aboutIntroTextLine2)}</span><br/>
          <span>{intl.formatMessage(messages.aboutIntroTextLine3)}</span><br/>
        </div>
        <div className={classnames([styles.middleComponent, styles.middleComponentAbout])}>
          <div className={styles.prerequisiteBlock}>
            <div>
              <SvgInline svg={aboutPrerequisiteIconSVG} cleanup={['title']} />
              <span className={styles.prerequisiteHeaderText}>{intl.formatMessage(messages.aboutPrerequisiteHeader)}</span>
            </div>
            <ul>
              <li key="1">
                {intl.formatMessage(messages.aboutPrerequisite1Part1)}
                <a target="_blank" href={intl.formatMessage(messages.aboutPrerequisite1Part2Link)}>
                  {intl.formatMessage(messages.aboutPrerequisite1Part2LinkText)}
                  <SvgInline svg={externalLinkSVG} cleanup={['title']} />
                </a>
                {intl.formatMessage(messages.aboutPrerequisite1Part3)}
              </li>
              <li key="2">{intl.formatMessage(messages.aboutPrerequisite2)}</li>
              <li key="3">{intl.formatMessage(messages.aboutPrerequisite3)}</li>
              <li key="4">{intl.formatMessage(messages.aboutPrerequisite4)}</li>
              <li key="5">{intl.formatMessage(messages.aboutPrerequisite5)}</li>
              <li key="6">{intl.formatMessage(messages.aboutPrerequisite6)}</li>
            </ul>
          </div>
          <div className={styles.trezorImageBlock}>
            <SvgInline svg={aboutPrerequisiteTrezorSVG} cleanup={['title']} />
          </div>
        </div>
        <div className={styles.yoroiLinkComponent}>
          <a target="_blank" href={intl.formatMessage(messages.helpLinkYoroiWithTrezor)}>
            {intl.formatMessage(messages.helpLinkYoroiWithTrezorText)}
            <SvgInline svg={externalLinkSVG} cleanup={['title']} />
          </a>
        </div>
        <div className={styles.liveInfoComponent}>
          <span>{this.state.error_or_live_info_text}</span>
        </div>        
        </Dialog>
      );
    } else if(this.progressState === ProgressStateOption.CONNECT_LOAD) {
      const actions = [{
        className: this.state.action_btn_processing ? styles.isProcessing : null,
        label: this.state.action_btn_name,
        primary: true,
        disabled: this.state.action_btn_processing,
        onClick: this.onConnect
      }];
      dialog = (
        <Dialog
          className={classnames([styles.component, 'WalletTrezorDialog'])}
          title={intl.formatMessage(messages.title)}
          closeOnOverlayClick={false}
          onClose={onCancel}
          actions={actions}
          closeButton={<DialogCloseButton />}
          backButton={<DialogBackButton onBack={this.onBackToAbout} />}
        >
        {progressStep}
        <div className={styles.headerComponent}>
          <span>{intl.formatMessage(messages.connectIntroTextLine1)}</span><br/>
          <span>{intl.formatMessage(messages.connectIntroTextLine2)}</span><br/>
          <span>{intl.formatMessage(messages.connectIntroTextLine3)}</span><br/>
        </div>
        <div className={classnames([styles.middleComponent, styles.middleComponentConnectLoad])}>
          <img src={connectLoadGIF}/>
        </div>
        <div className={styles.yoroiLinkComponent}>
          <a target="_blank" href={intl.formatMessage(messages.helpLinkYoroiWithTrezor)}>
            {intl.formatMessage(messages.helpLinkYoroiWithTrezorText)}
            <SvgInline svg={externalLinkSVG} cleanup={['title']} />
          </a>
        </div>
        <div className={styles.liveInfoComponent}>
          <span>{this.state.error_or_live_info_text}</span>
        </div>
        </Dialog>
      );
    } else if(this.progressState === ProgressStateOption.CONNECT_START) {
      const actions = [{
        className: this.state.action_btn_processing ? styles.isProcessing : null,
        label: this.state.action_btn_name,
        primary: true,
        disabled: this.state.action_btn_processing,
        onClick: this.onConnect
      }];
      dialog = (
        <Dialog
          className={classnames([styles.component, 'WalletTrezorDialog'])}
          title={intl.formatMessage(messages.title)}
          closeOnOverlayClick={false}
          onClose={onCancel}
          actions={actions}
          closeButton={<DialogCloseButton />}
        >
        {progressStep}
        <div className={styles.headerComponent}>
          <span>{intl.formatMessage(messages.connectIntroTextLine1)}</span><br/>
          <span>{intl.formatMessage(messages.connectIntroTextLine2)}</span><br/>
          <span>{intl.formatMessage(messages.connectIntroTextLine3)}</span><br/>
        </div>
        <div className={classnames([styles.middleComponent, styles.middleComponentConnectStart])}>
          <img src={connectStartGIF}/>
        </div>
        <div className={styles.yoroiLinkComponent}>
          <a target="_blank" href={intl.formatMessage(messages.helpLinkYoroiWithTrezor)}>
            {intl.formatMessage(messages.helpLinkYoroiWithTrezorText)}
            <SvgInline svg={externalLinkSVG} cleanup={['title']} />
          </a>
        </div>
        <div className={styles.liveInfoComponent}>
          <span>{this.state.error_or_live_info_text}</span>
        </div>
        </Dialog>
      );
    } else if(this.progressState === ProgressStateOption.CONNECT_ERROR) {
      const actions = [{
        className: this.state.action_btn_processing ? styles.isProcessing : null,
        label: this.state.action_btn_name,
        primary: true,
        disabled: this.state.action_btn_processing,
        onClick: this.onConnect
      }];
      dialog = (
        <Dialog
          className={classnames([styles.component, 'WalletTrezorDialog'])}
          title={intl.formatMessage(messages.title)}
          closeOnOverlayClick={false}
          onClose={onCancel}
          actions={actions}
          closeButton={<DialogCloseButton />}
          backButton={<DialogBackButton onBack={this.onBackToAbout} />}
        >
        {progressStep}
        <div className={styles.headerComponent}>
          <span>{intl.formatMessage(messages.connectIntroTextLine1)}</span><br/>
          <span>{intl.formatMessage(messages.connectIntroTextLine2)}</span><br/>
          <span>{intl.formatMessage(messages.connectIntroTextLine3)}</span><br/>
        </div>
        <div className={classnames([styles.middleComponent, styles.middleComponentConnectError])}>
          <SvgInline svg={connectErrorSVG} cleanup={['title']} />
        </div>
        <div className={styles.yoroiLinkComponent}>
          <a target="_blank" href={intl.formatMessage(messages.helpLinkYoroiWithTrezor)}>
            {intl.formatMessage(messages.helpLinkYoroiWithTrezorText)}
            <SvgInline svg={externalLinkSVG} cleanup={['title']} />
          </a>
        </div>
        <div className={classnames([styles.liveInfoComponent, styles.errorBlock])}>
          <span>{this.state.error_or_live_info_text}</span>
        </div>
        </Dialog>
      );
    } else if(this.progressState === ProgressStateOption.SAVE_LOAD) {
      const actions = [{
        className: this.state.action_btn_processing ? styles.isProcessing : null,
        label: this.state.action_btn_name,
        primary: true,
        disabled: this.state.action_btn_processing,
        onClick: this.onSave
      }];

      dialog = (
        <Dialog
          className={classnames([styles.component, 'WalletTrezorDialog'])}
          title={intl.formatMessage(messages.title)}
          closeOnOverlayClick={false}
          onClose={onCancel}
          actions={actions}
          closeButton={<DialogCloseButton />}
        >
        {progressStep}
        <div className={classnames([styles.headerComponent, styles.headerComponentSave])}>
          <Input
            className={walletNameFieldClasses}
            {...walletNameField.bind()}
            error={walletNameField.error}
            skin={<SimpleInputSkin />}
          />
          <span>{intl.formatMessage(messages.saveWalletNameInputBottomInfo)}</span>
        </div>
        <div className={classnames([styles.middleComponent, styles.middleComponentSaveLoad])}>
          <SvgInline svg={saveLoadGIF} cleanup={['title']} />
        </div>
        <div className={styles.yoroiLinkComponent}>
          <a target="_blank" href={intl.formatMessage(messages.helpLinkYoroiWithTrezor)}>
            {intl.formatMessage(messages.helpLinkYoroiWithTrezorText)}
            <SvgInline svg={externalLinkSVG} cleanup={['title']} />
          </a>
        </div>
        <div className={styles.liveInfoComponent}>
          <span>{this.state.error_or_live_info_text}</span>
        </div>
        </Dialog>
      );
    } else if(this.progressState === ProgressStateOption.SAVE_START) {
      const actions = [{
        className: this.state.action_btn_processing ? styles.isProcessing : null,
        label: this.state.action_btn_name,
        primary: true,
        disabled: this.state.action_btn_processing,
        onClick: this.onSave
      }];
      dialog = (
        <Dialog
          className={classnames([styles.component, 'WalletTrezorDialog'])}
          title={intl.formatMessage(messages.title)}
          closeOnOverlayClick={false}
          onClose={onCancel}
          actions={actions}
          closeButton={<DialogCloseButton />}
        >
        {progressStep}
        <div className={classnames([styles.headerComponent, styles.headerComponentSave])}>
          <Input
            className={walletNameFieldClasses}
            {...walletNameField.bind()}
            error={walletNameField.error}
            skin={<SimpleInputSkin />}
          />
          <span>{intl.formatMessage(messages.saveWalletNameInputBottomInfo)}</span>
        </div>
        <div className={classnames([styles.middleComponent, styles.middleComponentSaveStart])}>
          <SvgInline svg={saveStartSVG} cleanup={['title']} />
        </div>
        <div className={styles.yoroiLinkComponent}>
          <a target="_blank" href={intl.formatMessage(messages.helpLinkYoroiWithTrezor)}>
            {intl.formatMessage(messages.helpLinkYoroiWithTrezorText)}
            <SvgInline svg={externalLinkSVG} cleanup={['title']} />
          </a>
        </div>
        <div className={styles.liveInfoComponent}>
          <span>{this.state.error_or_live_info_text}</span>
        </div>
        </Dialog>
      );
    } else if(this.progressState === ProgressStateOption.SAVE_ERROR) {
      const actions = [{
        className: this.state.action_btn_processing ? styles.isProcessing : null,
        label: this.state.action_btn_name,
        primary: true,
        disabled: this.state.action_btn_processing,
        onClick: this.onSave
      }];
      dialog = (
        <Dialog
          className={classnames([styles.component, 'WalletTrezorDialog'])}
          title={intl.formatMessage(messages.title)}
          closeOnOverlayClick={false}
          onClose={onCancel}
          actions={actions}
          closeButton={<DialogCloseButton />}
        >
        {progressStep}
        <div className={classnames([styles.headerComponent, styles.headerComponentSave])}>
          <Input
            className={walletNameFieldClasses}
            {...walletNameField.bind()}
            error={walletNameField.error}
            skin={<SimpleInputSkin />}
          />
          <span>{intl.formatMessage(messages.saveWalletNameInputBottomInfo)}</span>          
        </div>
        <div className={styles.middleComponent}>
          <SvgInline svg={saveErrorSVG} cleanup={['title']} />
        </div>
        <div className={styles.yoroiLinkComponent}>
          <a target="_blank" href={intl.formatMessage(messages.helpLinkYoroiWithTrezor)}>
            {intl.formatMessage(messages.helpLinkYoroiWithTrezorText)}
            <SvgInline svg={externalLinkSVG} cleanup={['title']} />
          </a>
        </div>
        <div className={classnames([styles.liveInfoComponent, styles.errorBlock])}>
          <span>{this.state.error_or_live_info_text}</span>
        </div>
        </Dialog>
      );
    } else {
      console.error(`Error state, handle render for : ${this.progressState}`);
    }

    return dialog;
  }

  onBackToAbout = async () => {
    this.progressState = ProgressStateOption.ABOUT;
    await this._updateState();
  }

  onNext = async () => {
    this.progressState = ProgressStateOption.CONNECT_LOAD;
    await this._updateState();
  }

  onConnect = async () => {
    // FIXME: check about TrezorBridge/WebUSB 
    let cardanoGetPublicKeyResp : CardanoGetPublicKey | any = null;

    try {
      await this._addTrezorConnectEventListeners();
      this.progressState = ProgressStateOption.CONNECT_START;
      await this._updateState();

      // FIXME : find better place to store constants
      cardanoGetPublicKeyResp = await TrezorConnect.cardanoGetPublicKey({ path: 'm/44\'/1815\'/0\'' });
    } catch (error) {
      console.error('TrezorConnectError onConnect : ' + JSON.stringify(error, null, ''));
    } finally {
      await this._removeTrezorConnectEventListeners();
      await this._validateTrezorResponse(cardanoGetPublicKeyResp);

      if(this._isTrezorResponseValid()) {
        this.progressState = ProgressStateOption.SAVE_LOAD;
      } else {
        this.progressState = ProgressStateOption.CONNECT_ERROR;
      }

      await this._updateState();
    }
  }

  _addTrezorConnectEventListeners = async () => {
    TrezorConnect.on(DEVICE_EVENT, this._onTrezorDeviceEvent.bind(this));
    TrezorConnect.on(UI_EVENT, this._onTrezorUIEvent.bind(this));
  }
  
  _removeTrezorConnectEventListeners = async () => {
    TrezorConnect.off(DEVICE_EVENT, this._onTrezorDeviceEvent);
    TrezorConnect.off(UI_EVENT, this._onTrezorUIEvent);
  }

  _onTrezorDeviceEvent = (event: DeviceMessage) => {
    console.log(`Trezor DEVICE_EVENT: ${event.type} : ` + JSON.stringify(event, null, ' '));
    this.trezorEventDevice = event;
  }

  _onTrezorUIEvent = (event: UiMessage) => {
    console.log(`Trezor UI_EVENT : ${event.type} : ` + JSON.stringify(event, null, ' '));
    // FIXME: trezord forces close issue
    // if(event.type === CLOSE_UI_WINDOW && 
    //   this.progressState === ProgressStateOption.CONNECT_START &&
    //   this.publicKeyInfo.valid === false) {
    //   this.progressState = ProgressStateOption.CONNECT_ERROR;
    //   this.publicKeyInfo.errorId = 'trezord forcefully stopped';
    //   this._updateState();
    // }
  }  

  _validateTrezorResponse = async (cardanoGetPublicKeyResp: CardanoGetPublicKey) => {
    const trezorDeviceInfo = {};
    trezorDeviceInfo.valid = false;
    trezorDeviceInfo.errorId = '';

    if(!cardanoGetPublicKeyResp.success) {
      switch(cardanoGetPublicKeyResp.payload.error) {
        case 'Permissions not granted':
          trezorDeviceInfo.errorId = 'connectError2001';
          break;
        case 'Popup closed':
          trezorDeviceInfo.errorId = 'connectError2002';
          break;          
        default:
          trezorDeviceInfo.errorId = 'connectError1002';
          break;
      }
    }
    
    if(!trezorDeviceInfo.errorId && cardanoGetPublicKeyResp.payload.publicKey.length <= 0) {
      trezorDeviceInfo.errorId = 'connectError1002';
    }
    
    if(!trezorDeviceInfo.errorId && this.trezorEventDevice.payload.type != 'acquired') {
      trezorDeviceInfo.errorId = 'connectError1002';
    }
    
    if(!trezorDeviceInfo.errorId) {
      if(this.trezorEventDevice.payload.type === 'acquired') {
        trezorDeviceInfo.features = Object.assign({}, this.trezorEventDevice.payload.features);
      }
      trezorDeviceInfo.valid = true;
      trezorDeviceInfo.cardanoGetPublicKeyResult = cardanoGetPublicKeyResp;
    }

    this.trezorDeviceInfo = trezorDeviceInfo;
  }

  _isTrezorResponseValid() {
    return this.trezorDeviceInfo.valid;
  }    

  onSave = async () => {

    this.form.submit({
      onSuccess: async (form) => {
        this.setState({ isSubmitting: true });
        this.progressState = ProgressStateOption.SAVE_START;
        await this._updateState();

        const { walletName } = form.values();
        const walletData = {
          publicMasterKey: this.trezorDeviceInfo.cardanoGetPublicKeyResult.payload.publicKey,
          walletName: walletName,
          deviceFeatures: this.trezorDeviceInfo.features
        };
        this.props.onSubmit(walletData);
      },
      onError: () => {
        this.setState({ isSubmitting: false });
      },
    });
  }
}