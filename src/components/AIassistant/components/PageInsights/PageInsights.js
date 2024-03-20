import { spacing } from '@ui5/webcomponents-react-base';
import InsightPanel from './InsightPanel';
import './PageInsights.scss';

export default function PageInsights() {
  return (
    <div className="page-insights-list" style={spacing.sapUiTinyMarginBeginEnd}>
      <InsightPanel
        resourceType="Namespace"
        resourceName="istio-system"
        status="Warning"
      />
      <InsightPanel
        resourceType="Service"
        resourceName="email-service"
        status="Error"
      />
      <InsightPanel
        resourceType="Deployment"
        resourceName="api-gateway-controller-manager"
        status="Success"
      />
    </div>
  );
}
