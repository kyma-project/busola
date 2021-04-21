import React from 'react';
import { Checkbox, FormLabel, FormItem, Switch } from 'fundamental-react';
import ServiceListItem from './ServiceListItem';

export function BindableServicesList({
  services,
  availableServices,
  setServices,
}) {
  if (!services) services = [];
  const [allServices, setAllServices] = React.useState(!services.length);

  const [servicesList, setServicesList] = React.useState(
    availableServices.map(s => ({
      isChecked: !!services.find(svc => svc.id === s.id),
      displayName: s.displayName,
      id: s.id,
      hasAPIs: !!s.entries.find(e => e.type === 'API'),
      hasEvents: !!s.entries.find(e => e.type === 'Events'),
    })),
  );

  React.useEffect(() => {
    if (allServices) {
      setServices(availableServices);
    } else {
      setServices(servicesList.filter(t => t.isChecked));
    }
  }, [servicesList, allServices, availableServices, setServices]);

  const noServicesMessage = (
    <p className="fd-has-color-text-4 fd-has-margin-top-s fd-has-margin-bottom-s">
      This Application doesn't expose any Service or Events.
    </p>
  );

  const servicesForm = (
    <>
      <FormItem>
        <Switch
          checked={allServices}
          onChange={() => setAllServices(!allServices)}
        >
          Select all
        </Switch>
      </FormItem>
      {!allServices && (
        <ul>
          {servicesList.map(service => {
            return (
              <li key={service.id} className="fd-has-display-flex">
                <Checkbox
                  className="fd-has-display-inline-block"
                  defaultChecked={service.isChecked}
                  onChange={() => {
                    service.isChecked = !service.isChecked;
                    setServicesList([...servicesList]);
                  }}
                />
                <ServiceListItem service={service} />
              </li>
            );
          })}
        </ul>
      )}
    </>
  );

  return (
    <>
      <FormLabel required className="fd-has-margin-top-s">
        Applications & Events
      </FormLabel>
      {servicesList?.length ? servicesForm : noServicesMessage}
    </>
  );
}
