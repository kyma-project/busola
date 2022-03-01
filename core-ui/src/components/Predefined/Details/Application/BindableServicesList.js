import React from 'react';
import { Checkbox, FormLabel, FormItem, Switch } from 'fundamental-react';
import ServiceListItem from './ServiceListItem';
import { useTranslation } from 'react-i18next';

export function BindableServicesList({
  services,
  availableServices,
  setServices,
}) {
  const { t } = useTranslation();

  if (!services) services = [];
  const [allServices, setAllServices] = React.useState(
    services.length === 0 || services.length === availableServices.length,
  );

  const [servicesList, setServicesList] = React.useState([
    {
      isChecked: false,
      displayName: 'fejkowy serwis',
      id: 'a',
      hasAPIs: true,
      hasEvents: true,
    },
    {
      isChecked: false,
      displayName: 'fejkowy serwis bez danych',
      id: 'ab',
      hasAPIs: false,
      hasEvents: false,
    },
  ]);

  React.useEffect(() => {
    if (allServices) {
      setServices(availableServices);
    } else {
      setServices(servicesList.filter(t => t.isChecked));
    }
  }, [servicesList, allServices, availableServices, setServices]);

  const noServicesMessage = (
    <p className="fd-has-color-status-4 fd-margin-top--sm fd-margin-bottom--sm">
      {t('applications.messages.dont-expose')}
    </p>
  );

  const servicesForm = (
    <>
      <FormItem>
        <Switch
          checked={allServices}
          onChange={() => setAllServices(!allServices)}
        >
          {t('applications.buttons.select-all')}
        </Switch>
      </FormItem>
      {!allServices && (
        <ul>
          {servicesList.map((service, index) => {
            return (
              <li key={service.id} className="fd-has-display-flex">
                <Checkbox
                  className="fd-has-display-inline-block"
                  defaultChecked={service.isChecked}
                  onChange={() => {
                    service.isChecked = !service.isChecked;
                    setServicesList([...servicesList]);
                  }}
                  aria-label={service.displayName + ' Chceckbox'}
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
      <FormLabel required className="fd-margin-top--sm">
        {t('applications.labels.applications-and-events')}
      </FormLabel>
      {servicesList?.length ? servicesForm : noServicesMessage}
    </>
  );
}
