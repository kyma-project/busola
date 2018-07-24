import { Event } from '../event';
import { Source } from '../source';
import { EventActivation } from './event-activation';



export class EventActivationResponse {
    data: {
        eventActivations: EventActivation[];
    };
}
