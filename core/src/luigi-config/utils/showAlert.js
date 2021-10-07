export function showAlert(props) {
  console.log(Luigi.initialized, props);
  Luigi.initialized ? Luigi.ux().showAlert(props) : alert(props.text);
}
