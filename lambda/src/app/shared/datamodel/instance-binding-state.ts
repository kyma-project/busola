import { InstanceBindingInfo } from './instance-binding-info';

export class InstanceBindingState {
    hasChanged: boolean;
    previousState: InstanceBindingInfo;
    currentState?: InstanceBindingInfo;
}
