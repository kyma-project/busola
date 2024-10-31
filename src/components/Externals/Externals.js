export default function Externals() {
  return (
    <iframe
      id="custom-extension"
      title="Custom extesnion"
      width="100%"
      height="50%"
      src="http://localhost:3001/backend/api/v1/namespaces/kyma-system/services/btp-manager-metrics-service:8080/proxy/"
    />
  );
}
