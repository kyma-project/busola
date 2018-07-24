import { IServiceBinding, IServiceBindingList } from './service-binding';
import { MetaDataOwner } from './generic/meta-data-owner';

export class ServiceBindingList extends MetaDataOwner implements IServiceBindingList {
    items: IServiceBinding[];
    constructor(input: IServiceBindingList) {
        super(input.metadata);
        this.items = input.items;
    }
}
