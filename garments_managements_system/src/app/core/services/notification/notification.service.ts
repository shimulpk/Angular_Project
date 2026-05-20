import { Injectable } from '@angular/core';
@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  success(message: string) {
    // In a real app, use ngx-toastr or sweetalert2
    console.log('SUCCESS:', message);
    alert('Success: ' + message);
  }

  error(message: string) {
    console.error('ERROR:', message);
    alert('Error: ' + message);
  }

  info(message: string) {
    console.info('INFO:', message);
    alert('Info: ' + message);
  }
}
