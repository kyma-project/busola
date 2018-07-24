import React, { Component } from 'react';
import ReactModal from 'react-modal';
import dcopy from 'deep-copy';
import builder from '../../commons/builder';
import { ModalFooterFirst, ModalFooterSecond } from './ModalFooter.component';
import Tooltip from '../Tooltip/Tooltip.component';
import {
  getResourceDisplayName,
  clearEmptyPropertiesInObject,
} from '../../commons/helpers';
import { StepWrapperComponent } from './StepWrapper.component';
import { ModalHeader } from './ModalHeader.component';
import {
  ModalContent,
  ModalContentFirstStep,
  ModalContentSecondStep,
} from './ModalContent.component';

ReactModal.setAppElement('#root');

const customStyles = {
  content: {
    width: '680px',
    maxHeight: '80vh',
    padding: '0',
    borderRadius: '4px',
    backgroundColor: '#ffffff',
    boxShadow: '0 20px 32px 0 rgba(0, 0, 0, 0.2), 0 0 2px 0 rgba(0, 0, 0, 0.1)',
    top: '50%',
    left: '50%',
    bottom: 'auto',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    transform: 'translate(-50%, -50%)',
  },
};

class Modal extends Component {
  static INSTANCE_NAME_MAX_LENGTH = 63;

  constructor(props) {
    super(props);
    this.timer = null;
    this.state = {
      step: 1,
      formData: {
        name: '',
        label: '',
        plan: {},
      },
      invalidInstanceName: false,
      instanceWithNameAlreadyExists: false,
      firstStepFilled: false,
      result: {},
      loading: false,
      instanceCreateParameters: {},
    };
  }

  async componentDidMount() {
    if (this.props.serviceClass.serviceClass) {
      const defaultInstanceName = `${
        this.props.serviceClass.serviceClass.externalName
      }-instance`;
      const { data, error } = await this.refetchInstanceExists(
        defaultInstanceName,
      );
      this.setState({
        formData: {
          ...this.state.formData,
          name: defaultInstanceName,
          plan:
            this.props.serviceClass &&
            this.props.serviceClass.serviceClass &&
            this.props.serviceClass.serviceClass.plans[0].name,
        },
        firstStepFilled: true,
        instanceWithNameAlreadyExists:
          !error && data.serviceInstance && data.serviceInstance.name,
      });
    }
  }

  componentDidUpdate(nextProps, nextState) {
    clearTimeout(this.timer);
    if (
      nextState.formData.name !== this.state.formData.name &&
      !this.state.invalidInstanceName
    ) {
      this.timer = setTimeout(() => {
        this.checkNameExists(this.state.formData.name);
      }, 250);
    }
  }

  componentWillUnmount() {
    clearTimeout(this.timer);
  }

  handleCloseModal = async () => {
    this.props.closeModal();
  };

  nextStep = () => {
    this.setState({
      step: this.state.step + 1,
    });
  };

  previousStep = () => {
    this.setState({
      step: this.state.step - 1,
    });
  };

  onChangeNameInput = e => {
    const inputValue = e.target.value;

    this.setState({
      firstStepFilled: !inputValue ? false : true,
      invalidInstanceName: this.validateInstanceName(inputValue),
      instanceWithNameAlreadyExists: false,
      formData: {
        ...this.state.formData,
        name: inputValue,
      },
    });
  };

  onChangeLabels = e => {
    this.setState({
      formData: {
        ...this.state.formData,
        label: e.target.value,
      },
    });
  };

  onChangePlans = e => {
    this.setState({
      formData: {
        ...this.state.formData,
        plan: e.target.value,
      },
    });
  };

  onChangeSchemaForm = ({ formData }) => {
    this.setState({
      instanceCreateParameters: {
        ...this.state.instanceCreateParameters,
        ...formData,
      },
    });
  };

  onSubmitSchemaForm = async (params = {}) => {
    const errors = params.errors;

    if (errors && errors.length > 0) {
      this.setState({
        result: {
          title: "Form is not valid",
          message: errors.join(", "),
          color: '#ee0000',
          icon: '\uE0B1',
        },
      });
      return;
    }

    const currentPlan =
      this.props.serviceClass.serviceClass.plans.find(
        e => e.name === this.state.formData.plan,
      ) ||
      (this.props.serviceClass.serviceClass.plans.length &&
        this.props.serviceClass.serviceClass.plans[0]);

    let instanceCreateParameters;
    if (params.formData) {
      instanceCreateParameters = dcopy(params.formData);
      clearEmptyPropertiesInObject(instanceCreateParameters);
    } else {
      instanceCreateParameters = {};
    }

    const labels =
      this.state.formData.label === ''
        ? []
        : this.state.formData.label
            .replace(/\s+/g, '')
            .toLowerCase()
            .split(',');
    const variables = {
      name: this.state.formData.name,
      environment: builder.getCurrentEnvironmentId(),
      externalServiceClassName: this.props.serviceClass.serviceClass
        .externalName,
      externalPlanName: currentPlan && currentPlan.externalName,
      labels,
      parameterSchema: {
        ...instanceCreateParameters,
      },
    };

    let success = true;
    this.setState({
      loading: true,
    });
    try {
      await this.props.createServiceInstance({
        variables,
      });
      const sendNotification = this.props.sendNotification;
      if (typeof sendNotification === 'function') {
        sendNotification({
          variables: {
            title: `Instance "${variables.name}" created successfully`,
            color: '#359c46',
            icon: '\uE05B',
          },
        });
      }
    } catch (err) {
      success = false;
      this.setState({
        result: {
          title: "Couldn't create an instance",
          message: err.message,
          color: '#ee0000',
          icon: '\uE0B1',
        },
      });
    }

    if (!success) {
      this.setState({
        loading: false,
      });
      return;
    }

    this.handleCloseModal();
  };

  submitForm = () => {
    if (this.submitBtn) {
      this.submitBtn.click();
      return;
    }

    this.onSubmitSchemaForm();
  };

  refetchInstanceExists = async name => {
    return await this.props.instanceExists.refetch({
      name,
      environment: builder.getCurrentEnvironmentId(),
    });
  };

  checkNameExists = async name => {
    const { data, error } = await this.refetchInstanceExists(name);
    this.setState({
      instanceWithNameAlreadyExists:
        !error && data.serviceInstance && data.serviceInstance.name,
    });
  };

  /*
    Service name (domain) must check special regexp:
    https://github.com/kubernetes/kubernetes/blob/7f2d0c0f710617ef1f5eec4745b23e0d3f360037/pkg/util/validation.go#L36

    Maximum length of service name is 63 characters:
    https://github.com/kubernetes/kubernetes/blob/7f2d0c0f710617ef1f5eec4745b23e0d3f360037/pkg/util/validation.go#L40
  */
  validateInstanceName = name => {
    const format = /^(([a-z0-9]|[a-z0-9][a-z0-9-]*[a-z0-9]))*([a-z0-9]|[a-z0-9][a-z0-9-]*[a-z0-9])$/.test(
      name,
    );
    const length = name.length > Modal.INSTANCE_NAME_MAX_LENGTH || !name.length;

    return !format || length;
  };

  invalidNameMessage = name => {
    if (!name.length) {
      return 'Please enter the name';
    }
    if (name[0] === '-' || name[name.length - 1] === '-') {
      return 'The instance name cannot begin or end with a dash';
    }
    if (name.length > 63) {
      return 'The maximum length of service name is 63 characters';
    }
    return 'The instance name can only contain lowercase alphanumeric characters or dashes';
  };

  getInstanceNameErrorMessage = () => {
    if (this.state.invalidInstanceName) {
      return this.invalidNameMessage(this.state.formData.name);
    }

    if (this.state.instanceWithNameAlreadyExists) {
      return `Instance with name "${
        this.state.instanceWithNameAlreadyExists
      }" already exists`;
    }

    return null;
  };

  dismissTooltip = () => {
    this.setState({ result: {} });
  };

  render() {
    const plans =
      (this.props.serviceClass &&
        this.props.serviceClass.serviceClass &&
        this.props.serviceClass.serviceClass.plans) ||
      [];

    const mappedPlans = plans.map((p, i) => (
      <option key={['plan', i].join('_')} value={p.name}>
        {getResourceDisplayName(p)}
      </option>
    ));

    const schema =
      plans.find(e => e.name === this.state.formData.plan) || plans[0];

    const instanceCreateParameterSchema =
      (schema && schema.instanceCreateParameterSchema) || null;

    const externalName =
      (this.props.serviceClass &&
        this.props.serviceClass.serviceClass &&
        this.props.serviceClass.serviceClass.externalName) ||
      '';

    const instanceNameErrorMessage = this.getInstanceNameErrorMessage();

    const environment = builder.getCurrentEnvironmentId();
    const result = this.state.result;
    const modalHeader = `Provision Service Class "${externalName}" in environment "${environment}"`;
    return (
      <div>
        <ReactModal isOpen={this.state.step === 1} style={customStyles}>
          <ModalHeader text={modalHeader} handleModal={this.handleCloseModal} />
          <StepWrapperComponent
            step={this.state.step}
            firstText="Base information"
            secondText={'Configuration'}
          />
          <ModalContent>
            <ModalContentFirstStep
              plans={mappedPlans}
              formData={this.state.formData}
              instanceNameErrorMessage={instanceNameErrorMessage}
              checkNameExists={this.checkNameExists}
              onChangeNameInput={this.onChangeNameInput}
              onChangePlans={this.onChangePlans}
              onChangeLabels={this.onChangeLabels}
            />
          </ModalContent>
          <ModalFooterFirst
            disabledNextButton={
              !this.state.firstStepFilled ||
              this.state.instanceWithNameAlreadyExists ||
              this.state.invalidInstanceName
            }
            handleModal={this.handleCloseModal}
            handleStep={() => this.nextStep()}
          />
        </ReactModal>

        <ReactModal isOpen={this.state.step === 2} style={customStyles}>
          <ModalHeader text={modalHeader} handleModal={this.handleCloseModal} />
          <StepWrapperComponent
            step={this.state.step}
            firstText="Base information"
            secondText={'Configuration'}
          />
          <ModalContent>
            <ModalContentSecondStep
              instanceCreateParameterSchema={instanceCreateParameterSchema}
              onChangeSchemaForm={this.onChangeSchemaForm}
              onSubmitSchemaForm={this.onSubmitSchemaForm}
              formData={this.state.instanceCreateParameters}
            >
              {/* Styled components don't work here */}
              <button
                className="hidden"
                type="submit"
                ref={submitBtn => (this.submitBtn = submitBtn)}
              >
                Submit
              </button>
            </ModalContentSecondStep>
          </ModalContent>
          <ModalFooterSecond
            close={this.handleCloseModal}
            handleStep={() => this.previousStep()}
            create={this.submitForm}
            loading={this.state.loading}
          >
            {result.message && (
              <Tooltip {...result} onClick={this.dismissTooltip} />
            )}
          </ModalFooterSecond>
        </ReactModal>
      </div>
    );
  }
}

export default Modal;
