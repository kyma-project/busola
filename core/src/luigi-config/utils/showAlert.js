export function showAlert(props) {
  Luigi.initialized ? Luigi.ux().showAlert(props) : alert(props.text);
}
