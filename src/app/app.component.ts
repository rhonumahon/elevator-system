import { Component, OnInit, OnDestroy } from '@angular/core';
import { ElevatorService } from './services/elevator.service';
import { Subscription } from 'rxjs';
import { Request } from './models/elevator.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less'],
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'elevator-system';
  elevatorPositions: string[] = []; // Holds the current status and positions of all elevators
  private elevatorStatusSubscription: Subscription | undefined; // Subscription for elevator status updates
  private elevatorRequestsInterval: any; // Interval handle for generating random requests
  request: Request = { floor: 0, direction: 'idle' }; // Holds the current request with floor and direction

  constructor(private elevatorService: ElevatorService) {}

  ngOnInit(): void {
    this.startRandomRequestGenerator(); // Start generating random requests every 10 seconds
    this.subscribeToElevatorStatus(); // Subscribe to elevator status updates
  }

  ngOnDestroy(): void {
    this.unsubscribeFromObservables(); // Cleanup observables and intervals when component is destroyed
  }

  private startRandomRequestGenerator(): void {
    this.elevatorRequestsInterval = setInterval(() => {
      this.elevatorService.generateRandomRequest().subscribe((item) => {
        this.request = item;
      });
    }, 10000); // Interval time of 10 seconds
  }

  private subscribeToElevatorStatus(): void {
    this.elevatorStatusSubscription = this.elevatorService
      .getElevatorStatusObservable() // Get the elevator status observable
      .subscribe((status: string[]) => {
        // Each time the elevator status is updated, store the new status in the elevatorPositions array
        this.elevatorPositions = status;
      });
  }

  private unsubscribeFromObservables(): void {
    // Clear the inteval used for generating random requests
    if (this.elevatorRequestsInterval) {
      clearInterval(this.elevatorRequestsInterval); //Clear the interval to stop generating requests
    }

    //Unsubscribe from the elevator status subscription to avoid memory leaks
    if (this.elevatorStatusSubscription) {
      this.elevatorStatusSubscription.unsubscribe(); //Unsubscribe to stop receiving updates
    }
  }
}
