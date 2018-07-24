import {Directive} from '@angular/core';
import {Router} from '@angular/router';
import {ExtAppViewRegistryService} from '../services/ext-app-view-registry.service';

@Directive({
  selector: '[extAppListener]'
})
export class ExtAppListenerDirective {

  constructor(private router: Router, private extAppViewRegistryService: ExtAppViewRegistryService) {
    window.addEventListener('message', this.processMessage.bind(this), false);
  }

  processMessage(event) {
    if (this.extAppViewRegistryService.isRegistered(event.source)) {
      let data;
      try {
        data = event.data;
        if (this.extAppViewRegistryService.isRegisteredSession(event.source, data.sessionId)) {
          if (data && data.msg.indexOf('navigation.') === 0) {
            this.processNavigationMessage(data);
          }
        } else {
          console.log('Received message from not registered session. Origin: ' + event.origin);
        }
      } catch (error) {
        console.log('There is no data.');
      }
    } else if (this.windowLocation(event.origin) === 0) {
      // ignore messages from self
    } else {
      console.log('Received message from not registered source. Origin: ' + event.origin);
    }
  }

  windowLocation(origin) {
    return window.location.href.indexOf(origin);
  }

  processNavigationMessage(data) {

    const sanitizeLinkManagerLink = (link) => {
      return link.replace(/[^-A-Za-z0-9 &+@/%=~_|!:,.;\(\)]/g, '');
    };

    if (data && data.msg === 'navigation.open') {
      if (data.params && data.params.link) {
        this.router.navigate([sanitizeLinkManagerLink(data.params.link)])
          .catch(e => {
            console.log('Route not found');
          });
      } else {
        console.log('missing "data.params.link" in the incoming message');
      }
    } else {
      console.log('unknown or missing message type in the incoming message');
    }
  }
}

