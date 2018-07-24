import { ActivatedRouteSnapshot } from '@angular/router';

export default class NavigationUtils {
  public static computeLeftNavCollapseState(snapshot: ActivatedRouteSnapshot) {
    let counter = 100;
    let node = snapshot;
    while (counter-- > 0 && node.children && node.children.length > 0) {
      node = node.children[0];
      if (node.data && node.data.leftNavCollapsed === true) {
        return true;
      }
    }
    return false;
  }
}
